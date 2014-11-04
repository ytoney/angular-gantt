'use strict';
gantt.factory('Gantt', [
    '$filter', 'GanttRow', 'GanttTimespan', 'GanttColumnGenerator', 'GanttHeaderGenerator', 'moment', 'ganttBinarySearch', 'ganttLayout', 'GANTT_EVENTS',
    function($filter, Row, Timespan, ColumnGenerator, HeaderGenerator, moment, bs, layout, GANTT_EVENTS) {

    function sortByGourp(data,callback){
      var _groups =[];
      var _def = '_empty';
      var groups = {};
      var groupNames =[];
      var rows =[];
      function addGroup(name,row){
        if(!groups[name]){
          groupNames.push(name);
          groups[name] = [];
        }
        groups[name].push(row);
      }

      for(var i=0;i<data.length;i++){
        var row = data[i];
        if(row.data && row.data.group){
          addGroup(row.data.group,row);
        }else{
          addGroup(_def,row);
        }
      }
      for(var k in groups){
//        var _group = {
//          name:k,
//          rows:groups[k],
//          count:groups[k].length,
//          height:0
//        };
//        _groups.push(_group);
//        _group.height = _group.count*Row.defaultHeight +'px';
        Array.prototype.push.apply(rows,groups[k]);
      }
      callback(rows,_groups,groups,groupNames);
    }

    // Gantt logic. Manages the columns, rows and sorting functionality.
    var Gantt = function($scope, $element) {
        var self = this;
        self.$scope = $scope;
        self.$element = $element;

        self.rowsMap = {};
        self.rows = [];
        self.filteredRows = [];
        self.visibleRows = [];

        self.timespansMap = {};
        self.timespans = [];

        self.columns = [];
        self.visibleColumns = [];

        self.headers = {};
        self.visibleHeaders = {};

        self.previousColumns = [];
        self.nextColumns = [];

        self.width = 0;

        self.from = undefined;
        self.to = undefined;

        self.scrollAnchor = undefined;

        // Add a watcher if a view related setting changed from outside of the Gantt. Update the gantt accordingly if so.
        // All those changes need a recalculation of the header columns
        $scope.$watch('viewScale+width+labelsWidth+columnWidth+timeFramesWorkingMode+timeFramesNonWorkingMode+columnMagnet', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                self.buildGenerators();
                self.clearColumns();
                self.updateColumns();
            }
        });

        $scope.$watch('fromDate+toDate+autoExpand+taskOutOfRange', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                self.updateColumns();
            }
        });

        $scope.$watch('currentDate+currentDateValue', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                self.setCurrentDate($scope.currentDateValue);
            }
        });

        $scope.$watch('ganttElementWidth+labelsWidth+showLabelsColumn+maxHeight', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                updateColumnsMeta();
            }
        });

        var updateVisibleColumns = function() {
            self.visibleColumns = $filter('ganttColumnLimit')(self.columns, $scope.scrollLeft, $scope.scrollWidth);

            angular.forEach(self.headers, function(headers, key) {
                if (self.headers.hasOwnProperty(key)) {
                    self.visibleHeaders[key] = $filter('ganttColumnLimit')(headers, $scope.scrollLeft, $scope.scrollWidth);
                }
            });
        };

        var updateVisibleRows = function() {
            var oldFilteredRows = self.filteredRows;
            if ($scope.filterRow) {
                self.filteredRows = $filter('filter')(self.rows, $scope.filterRow, $scope.filterRowComparator);
            } else {
                self.filteredRows = self.rows.slice(0);
            }
            sortByGourp(self.filteredRows,function(rows,_group,groups,groupNames){
              self.filteredRows = rows;
              self._group = _group;
              self.groups = groups;
              self.groupNames = groupNames;
            });
            var filterEventData;
            if (!angular.equals(oldFilteredRows, self.filteredRows)) {
                filterEventData = {rows: self.rows, filteredRows: self.filteredRows};
            }

            // TODO: Implement rowLimit like columnLimit to enhance performance for gantt with many rows
            self.visibleRows = self.filteredRows;
            if (filterEventData !== undefined) {
                $scope.$emit(GANTT_EVENTS.ROWS_FILTERED, filterEventData);
            }
        };

        var updateVisibleTasks = function() {
            var oldFilteredTasks = [];
            var filteredTasks = [];
            var tasks = [];
//          sortByGourp(self.filteredRows,function(rows,groups){
//            self.filteredRows = rows;
//          });
            angular.forEach(self.filteredRows, function(row) {
                oldFilteredTasks = oldFilteredTasks.concat(row.filteredTasks);
                row.updateVisibleTasks();
                filteredTasks = filteredTasks.concat(row.filteredTasks);
                tasks = tasks.concat(row.tasks);
            });

            var filterEventData;
            if (!angular.equals(oldFilteredTasks, filteredTasks)) {
                filterEventData = {tasks: tasks, filteredTasks: filteredTasks};
            }

            if (filterEventData !== undefined) {
                $scope.$emit(GANTT_EVENTS.TASKS_FILTERED, filterEventData);
            }
        };

        var updateVisibleObjects = function() {
            updateVisibleRows();
            updateVisibleTasks();
        };

        updateVisibleColumns();
        updateVisibleObjects();

        $scope.$watch('scrollLeft+scrollWidth', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                updateVisibleColumns();
                updateVisibleTasks();
            }
        });

        $scope.$watch('filterTask+filterTaskComparator', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                updateVisibleTasks();
            }
        });

        $scope.$watch('filterRow+filterRowComparator', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                updateVisibleRows();
            }
        });

        var setScrollAnchor = function() {
            if ($scope.template.scrollable && $scope.template.scrollable.$element && self.columns.length > 0) {
                var el = $scope.template.scrollable.$element[0];
                var center = el.scrollLeft + el.offsetWidth / 2;

                self.scrollAnchor = self.getDateByPosition(center);
            }
        };

        var getExpandedFrom = function(from) {
            from = from ? moment(from) : from;

            var minRowFrom = from;
            angular.forEach(self.rows, function(row) {
                if (minRowFrom === undefined || minRowFrom > row.from) {
                    minRowFrom = row.from;
                }
            });
            if (minRowFrom && (!from || minRowFrom < from)) {
                return minRowFrom;
            }
            return from;
        };

        var getExpandedTo = function(to) {
            to = to ? moment(to) : to;

            var maxRowTo = to;
            angular.forEach(self.rows, function(row) {
                if (maxRowTo === undefined || maxRowTo < row.to) {
                    maxRowTo = row.to;
                }
            });
            if (maxRowTo && (!$scope.toDate || maxRowTo > $scope.toDate)) {
                return maxRowTo;
            }
            return to;
        };

        // Generates the Gantt columns according to the specified from - to date range. Uses the currently assigned column generator.
        var generateColumns = function(from, to) {
            if (!from) {
                from = getDefaultFrom();
                if (!from) {
                    return false;
                }
            }

            if (!to) {
                to = getDefaultTo();
                if (!to) {
                    return false;
                }
            }

            if (self.from === from && self.to === to) {
                return false;
            }

            setScrollAnchor();

            self.from = from;
            self.to = to;

            self.columns = self.columnGenerator.generate(from, to);
            self.headers = self.headerGenerator.generate(self.columns);
            self.previousColumns = [];
            self.nextColumns = [];

            updateColumnsMeta();

            return true;
        };

        var setColumnsWidth = function(width, originalWidth, columns) {
            if (width && originalWidth && columns) {

                var widthFactor = Math.abs(width / originalWidth);

                angular.forEach(columns, function(column) {
                    column.left = widthFactor * column.originalSize.left;
                    column.width = widthFactor * column.originalSize.width;

                    angular.forEach(column.timeFrames, function(timeFrame) {
                        timeFrame.left = widthFactor * timeFrame.originalSize.left;
                        timeFrame.width = widthFactor * timeFrame.originalSize.width;
                    });
                });
            }
        };

        var updateColumnsMeta = function() {
            var lastColumn = self.getLastColumn();
            self.originalWidth = lastColumn !== undefined ? lastColumn.originalSize.left + lastColumn.originalSize.width : 0;

            if ($scope.columnWidth === undefined) {
                var newWidth = $scope.ganttElementWidth - ($scope.showLabelsColumn ? $scope.labelsWidth : 0);

                if ($scope.maxHeight > 0) {
                    newWidth = newWidth - layout.getScrollBarWidth();
                }

                setColumnsWidth(newWidth, self.originalWidth, self.previousColumns);
                setColumnsWidth(newWidth, self.originalWidth, self.columns);
                setColumnsWidth(newWidth, self.originalWidth, self.nextColumns);

                angular.forEach(self.headers, function(header) {
                    setColumnsWidth(newWidth, self.originalWidth, header);
                });
            }

            self.width = lastColumn !== undefined ? lastColumn.left + lastColumn.width : 0;

            if (self._currentDate !== undefined) {
                self.setCurrentDate(self._currentDate);
            }
            $scope.currentDatePosition = self.getPositionByDate($scope.currentDateValue);

            self.updateTasksPosAndSize();
            self.updateTimespansPosAndSize();

            updateVisibleColumns();
            updateVisibleObjects();
        };

        var expandExtendedColumnsForPosition = function(x) {
            if (x < 0) {
                var firstColumn = self.getFirstColumn();
                var from = firstColumn.date;
                var firstExtendedColumn = self.getFirstColumn(true);
                if (!firstExtendedColumn || firstExtendedColumn.left > x) {
                    self.previousColumns = self.columnGenerator.generate(from, undefined, -x, 0, true);
                }
                return true;
            } else if (x > self.width) {
                var lastColumn = self.getLastColumn();
                var endDate = lastColumn.getDateByPosition(lastColumn.width);
                var lastExtendedColumn = self.getLastColumn(true);
                if (!lastExtendedColumn || lastExtendedColumn.left + lastExtendedColumn.width < x) {
                    self.nextColumns = self.columnGenerator.generate(endDate, undefined, x - self.width, self.width, false);
                }
                return true;
            }
            return false;
        };

        var expandExtendedColumnsForDate = function(date) {
            var firstColumn = self.getFirstColumn();
            var from;
            if (firstColumn) {
                from = firstColumn.date;
            }

            var lastColumn = self.getLastColumn();
            var endDate;
            if (lastColumn) {
                endDate = lastColumn.getDateByPosition(lastColumn.width);
            }

            if (from && date < from) {
                var firstExtendedColumn = self.getFirstColumn(true);
                if (!firstExtendedColumn || firstExtendedColumn.date > date) {
                    self.previousColumns = self.columnGenerator.generate(from, date, undefined, 0, true);
                }
                return true;
            } else if (endDate && date > endDate) {
                var lastExtendedColumn = self.getLastColumn(true);
                if (!lastExtendedColumn || endDate < lastExtendedColumn) {
                    self.nextColumns = self.columnGenerator.generate(endDate, date, undefined, self.width, false);
                }
                return true;
            }
            return false;
        };

        // Sets the Gantt view scale. Call reGenerateColumns to make changes visible after changing the view scale.
        // The headers are shown depending on the defined view scale.
        self.buildGenerators = function() {
            self.columnGenerator = new ColumnGenerator($scope);
            self.headerGenerator = new HeaderGenerator($scope);
        };

        var getDefaultFrom = function() {
            var defaultFrom;
            angular.forEach(self.timespans, function(timespan) {
                if (defaultFrom === undefined || timespan.from < defaultFrom) {
                    defaultFrom = timespan.from;
                }
            });

            angular.forEach(self.rows, function(row) {
                if (defaultFrom === undefined || row.from < defaultFrom) {
                    defaultFrom = row.from;
                }
            });
            return defaultFrom;
        };

        var getDefaultTo = function() {
            var defaultTo;
            angular.forEach(self.timespans, function(timespan) {
                if (defaultTo === undefined || timespan.to > defaultTo) {
                    defaultTo = timespan.to;
                }
            });

            angular.forEach(self.rows, function(row) {
                if (defaultTo === undefined || row.to > defaultTo) {
                    defaultTo = row.to;
                }
            });
            return defaultTo;
        };

        self.updateColumns = function() {
            var from = $scope.fromDate;
            var to = $scope.toDate;
            if ($scope.taskOutOfRange === 'expand') {
                from = getExpandedFrom(from);
                to = getExpandedTo(to);
            }
            generateColumns(from, to);
        };

        // Removes all existing columns and re-generates them. E.g. after e.g. the view scale changed.
        // Rows can be re-generated only if there is a data-range specified. If the re-generation failed the function returns false.
        self.clearColumns = function() {
            setScrollAnchor();

            self.from = undefined;
            self.to = undefined;
            self.columns = [];
            self.visibleColumns = [];
            self.previousColumns = [];
            self.nextColumns = [];
            self.visibleHeaders = {};
            self.visibleRows = [];
        };

        // Update the position/size of all tasks in the Gantt
        self.updateTasksPosAndSize = function() {
            for (var i = 0, l = self.rows.length; i < l; i++) {
                self.rows[i].updateTasksPosAndSize();
            }
        };

        // Update the position/size of all timespans in the Gantt
        self.updateTimespansPosAndSize = function() {
            for (var i = 0, l = self.timespans.length; i < l; i++) {
                self.timespans[i].updatePosAndSize();
            }
        };

        // Returns the last Gantt column or undefined
        self.getLastColumn = function(extended) {
            var columns = self.columns;
            if (extended) {
                columns = self.nextColumns;
            }
            if (columns && columns.length > 0) {
                return columns[columns.length - 1];
            } else {
                return undefined;
            }
        };

        // Returns the first Gantt column or undefined
        self.getFirstColumn = function(extended) {
            var columns = self.columns;
            if (extended) {
                columns = self.previousColumns;
            }

            if (columns && columns.length > 0) {
                return columns[0];
            } else {
                return undefined;
            }
        };

        // Returns the column at the given or next possible date
        self.getColumnByDate = function(date) {
            expandExtendedColumnsForDate(date);
            var extendedColumns = self.previousColumns.concat(self.columns, self.nextColumns);
            var columns = bs.get(extendedColumns, date, function(c) {
                return c.date;
            });
            return columns[0] !== undefined ? columns[0] : columns[1];
        };

        // Returns the column at the given position x (in em)
        self.getColumnByPosition = function(x) {
            expandExtendedColumnsForPosition(x);
            var extendedColumns = self.previousColumns.concat(self.columns, self.nextColumns);
            return bs.get(extendedColumns, x, function(c) {
                return c.left;
            })[0];
        };

        // Returns the exact column date at the given position x (in em)
        self.getDateByPosition = function(x, magnet) {
            var column = self.getColumnByPosition(x);
            if (column !== undefined) {
                return column.getDateByPosition(x - column.left, magnet);
            } else {
                return undefined;
            }
        };

        // Returns the position inside the Gantt calculated by the given date
        self.getPositionByDate = function(date) {
            if (date === undefined) {
                return undefined;
            }

            if (!moment.isMoment(moment)) {
                date = moment(date);
            }

            var column = self.getColumnByDate(date);
            if (column !== undefined) {
                return column.getPositionByDate(date);
            } else {
                return undefined;
            }
        };

        // Returns the min and max date of all loaded tasks or undefined if there are no tasks loaded
        self.getTasksDateRange = function() {
            if (self.rows.length === 0) {
                return undefined;
            } else {
                var minDate, maxDate;

                for (var i = 0, l = self.rows.length; i < l; i++) {
                    var row = self.rows[i];

                    if (minDate === undefined || row.from < minDate) {
                        minDate = row.from;
                    }

                    if (maxDate === undefined || row.to > maxDate) {
                        maxDate = row.to;
                    }
                }

                return {
                    from: minDate,
                    to: maxDate
                };
            }
        };

        // Returns the number of active headers
        self.getActiveHeadersCount = function() {
            var size = 0, key;
            for (key in self.headers) {
                if (self.headers.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        };

        // Adds or update rows and tasks.
        self.addData = function(data) {
            //insert
            for (var i = 0, l = data.length; i < l; i++) {
                var rowData = data[i];
                addRow(rowData);
            }

            self.updateColumns();
            self.updateTasksPosAndSize();
            updateVisibleObjects();
        };

        // Adds a row or merges the row and its tasks if there is already one with the same id
        var addRow = function(rowData) {
            // Copy to new row (add) or merge with existing (update)
            var row, isUpdate = false;

            if (rowData.id in self.rowsMap) {
                row = self.rowsMap[rowData.id];
                row.copy(rowData);
                isUpdate = true;
                $scope.$emit(GANTT_EVENTS.ROW_CHANGED, {'row': row});
            } else {
                var order = rowData.order;

                // Check if the row has a order predefined. If not assign one
                if (order === undefined) {
                    order = self.highestRowOrder;
                }

                if (order >= self.highestRowOrder) {
                    self.highestRowOrder = order + 1;
                }

                row = new Row(rowData.id, self, rowData.name, order, rowData.height, rowData.color, rowData.classes, rowData.data);
                self.rowsMap[rowData.id] = row;
                self.rows.push(row);
                self.filteredRows.push(row);
                self.visibleRows.push(row);
                $scope.$emit(GANTT_EVENTS.ROW_ADDED, {'row': row});
            }

            if (rowData.tasks !== undefined && rowData.tasks.length > 0) {
                for (var i = 0, l = rowData.tasks.length; i < l; i++) {
                    row.addTask(rowData.tasks[i]);
                }
            }
            return isUpdate;
        };

        // Removes specified rows or tasks.
        // If a row has no tasks inside the complete row will be deleted.
        self.removeData = function(data) {
            for (var i = 0, l = data.length; i < l; i++) {
                var rowData = data[i];
                var row;

                if (rowData.tasks !== undefined && rowData.tasks.length > 0) {
                    // Only delete the specified tasks but not the row and the other tasks

                    if (rowData.id in self.rowsMap) {
                        row = self.rowsMap[rowData.id];

                        for (var j = 0, k = rowData.tasks.length; j < k; j++) {
                            row.removeTask(rowData.tasks[j].id);
                        }

                        $scope.$emit(GANTT_EVENTS.ROW_CHANGED, {'row': row});
                    }
                } else {
                    // Delete the complete row
                    row = removeRow(rowData.id);
                }
            }

            self.updateColumns();
            updateVisibleObjects();
        };

        // Removes the complete row including all tasks
        var removeRow = function(rowId) {
            if (rowId in self.rowsMap) {
                delete self.rowsMap[rowId]; // Remove from map

                var removedRow;
                var row;
                for (var i = self.rows.length -1; i >=0 ; i--) {
                    row = self.rows[i];
                    if (row.id === rowId) {
                        removedRow = row;
                        self.rows.splice(i, 1); // Remove from array
                    }
                }

                for (i = self.filteredRows.length -1; i >=0 ; i--) {
                    row = self.filteredRows[i];
                    if (row.id === rowId) {
                        self.filteredRows.splice(i, 1); // Remove from filtered array
                    }
                }

                for (i = self.visibleRows.length -1; i >=0 ; i--) {
                    row = self.visibleRows[i];
                    if (row.id === rowId) {
                        self.visibleRows.splice(i, 1); // Remove from visible array
                    }
                }

                $scope.$emit(GANTT_EVENTS.ROW_REMOVED, {'row': removedRow});
                return row;
            }

            return undefined;
        };

        // Removes all rows and tasks
        self.removeAllRows = function() {
            self.rowsMap = {};
            self.rows = [];
            self.filteredRows = [];
            self.visibleRows = [];
            self.highestRowOrder = 0;
            self.clearColumns();
            self.scrollAnchor = undefined;
        };

        // Removes all timespans
        self.removeAllTimespans = function() {
            self.timespansMap = {};
            self.timespans = [];
        };

        // Swaps two rows and changes the sort order to custom to display the swapped rows
        self.swapRows = function(a, b) {
            // Swap the two rows
            var order = a.order;
            a.order = b.order;
            b.order = order;
        };

        // Sort rows by the specified sort mode (name, order, custom)
        // and by Ascending or Descending
        self.sortRows = function() {
//            var reverse = false;
//            expression = expression;
//            if (expression.charAt(0) === '-') {
//                reverse = true;
//                expression = expression.substr(1);
//            }
//
//            var angularOrderBy = $filter('orderBy');
//            if (expression === 'custom') {
//                self.rows = angularOrderBy(self.rows, 'order', reverse);
//            } else {
//                self.rows = angularOrderBy(self.rows, expression, reverse);
//            }
//
//            updateVisibleRows();
        };

        // Adds or updates timespans
        self.addTimespans = function(timespans) {
            for (var i = 0, l = timespans.length; i < l; i++) {
                var timespanData = timespans[i];
                addTimespan(timespanData);
                var timespan = self.timespansMap[timespanData.id];
                timespan.updatePosAndSize();
            }
        };

        // Adds a timespan or merges the timespan if there is already one with the same id
        var addTimespan = function(timespanData) {
            // Copy to new timespan (add) or merge with existing (update)
            var timespan, isUpdate = false;

            if (timespanData.id in self.timespansMap) {
                timespan = self.timespansMap[timespanData.id];
                timespan.copy(timespanData);
                isUpdate = true;
            } else {
                timespan = new Timespan(timespanData.id, self, timespanData.name, timespanData.color,
                    timespanData.classes, timespanData.priority, timespanData.from, timespanData.to, timespanData.data);
                self.timespansMap[timespanData.id] = timespan;
                self.timespans.push(timespan);
                $scope.$emit(GANTT_EVENTS.TIMESPAN_ADDED, {timespan: timespan});
            }

            return isUpdate;
        };

        self.setCurrentDate = function(currentDate) {
            self._currentDate = currentDate;
            if (self._currentDateColumn !== undefined) {
                delete self._currentDateColumn;
            }

            if (self._currentDate !== undefined) {
                var column = self.getColumnByDate(self._currentDate);
                if (column !== undefined) {
                    column.currentDate = self._currentDate;
                    self._currentDateColumn = column;
                }
            }

            $scope.currentDatePosition = self.getPositionByDate($scope.currentDateValue);
        };
        self.buildGenerators();
        self.clearColumns();
        self.updateColumns();
        self.setCurrentDate($scope.currentDateValue);
    };

    return Gantt;
}]);
