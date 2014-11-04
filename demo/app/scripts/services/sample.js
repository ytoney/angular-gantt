'use strict';

/**
 * @ngdoc service
 * @name angularGanttDemoApp.Sample
 * @description
 * # Sample
 * Service in the angularGanttDemoApp.
 */
angular.module('angularGanttDemoApp')
    .service('Sample', function Sample() {
        return {
            getSampleData: function() {
                return {
                    'data1': [
                        // Order is optional. If not specified it will be assigned automatically
                        {'id': '2f85dbeb-0845-404e-934e-218bf39750c0', 'name': 'Milestones', 'order': 0, 'height': '3em', classes: 'gantt-row-milestone', 'color': '#45607D', 'tasks': [
                            // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
                            {'id': 'f55549b5-e449-4b0c-9f4b-8b33381f7d76', 'name': 'Kickoff', 'color': '#93C47D', 'from': '2013-10-07T09:00:00', 'to': '2013-10-07T10:00:00', 'data': 'Can contain any custom data or object'},
                            {'id': '5e997eb3-4311-46b1-a1b4-7e8663ea8b0b', 'name': 'Concept approval', 'color': '#93C47D', 'from': new Date(2013, 9, 18, 18, 0, 0), 'to': new Date(2013, 9, 18, 18, 0, 0), 'est': new Date(2013, 9, 16, 7, 0, 0), 'lct': new Date(2013, 9, 19, 0, 0, 0)},
                            {'id': 'b6a1c25c-85ae-4991-8502-b2b5127bc47c', 'name': 'Development finished', 'color': '#93C47D', 'from': new Date(2013, 10, 15, 18, 0, 0), 'to': new Date(2013, 10, 15, 18, 0, 0)},
                            {'id': '6fdfd775-7b22-42ec-a12c-21a64c9e7a9e', 'name': 'Shop is running', 'color': '#93C47D', 'from': new Date(2013, 10, 22, 12, 0, 0), 'to': new Date(2013, 10, 22, 12, 0, 0)},
                            {'id': 'c112ee80-82fc-49ba-b8de-f8efba41b5b4', 'name': 'Go-live', 'color': '#93C47D', 'from': new Date(2013, 10, 29, 16, 0, 0), 'to': new Date(2013, 10, 29, 16, 0, 0)}
                        ], 'data': 'Can contain any custom data or object'},
                        {'id': 'b8d10927-cf50-48bd-a056-3554decab824', 'name': 'Status meetings', 'order': 1, 'tasks': [
                            {'id': '301d781f-1ef0-4c35-8398-478b641c0658', 'name': 'Demo', 'color': '#9FC5F8', 'from': new Date(2013, 9, 25, 15, 0, 0), 'to': new Date(2013, 9, 25, 18, 30, 0)},
                            {'id': '0fbf344a-cb43-4b20-8003-a789ba803ad8', 'name': 'Demo', 'color': '#9FC5F8', 'from': new Date(2013, 10, 1, 15, 0, 0), 'to': new Date(2013, 10, 1, 18, 0, 0)},
                            {'id': '12af138c-ba21-4159-99b9-06d61b1299a2', 'name': 'Demo', 'color': '#9FC5F8', 'from': new Date(2013, 10, 8, 15, 0, 0), 'to': new Date(2013, 10, 8, 18, 0, 0)},
                            {'id': '73294eca-de4c-4f35-aa9b-ae25480967ba', 'name': 'Demo', 'color': '#9FC5F8', 'from': new Date(2013, 10, 15, 15, 0, 0), 'to': new Date(2013, 10, 15, 18, 0, 0)},
                            {'id': '75c3dc51-09c4-44fb-ac40-2f4548d0728e', 'name': 'Demo', 'color': '#9FC5F8', 'from': new Date(2013, 10, 24, 9, 0, 0), 'to': new Date(2013, 10, 24, 10, 0, 0)}
                        ]},
                        {'id': 'c65c2672-445d-4297-a7f2-30de241b3145', 'name': 'Kickoff', 'order': 2, 'tasks': [
                            {'id': '4e197e4d-02a4-490e-b920-4881c3ba8eb7', 'name': 'Day 1', 'color': '#9FC5F8', 'from': new Date(2013, 9, 7, 9, 0, 0), 'to': new Date(2013, 9, 7, 17, 0, 0),
                                'progress': {'percent': 100, 'color': '#3C8CF8'}},
                            {'id': '451046c0-9b17-4eaf-aee0-4e17fcfce6ae', 'name': 'Day 2', 'color': '#9FC5F8', 'from': new Date(2013, 9, 8, 9, 0, 0), 'to': new Date(2013, 9, 8, 17, 0, 0),
                                'progress': {'percent': 100, 'color': '#3C8CF8'}},
                            {'id': 'fcc568c5-53b0-4046-8f19-265ebab34c0b', 'name': 'Day 3', 'color': '#9FC5F8', 'from': new Date(2013, 9, 9, 8, 30, 0), 'to': new Date(2013, 9, 9, 12, 0, 0),
                                'progress': {'percent': 100, 'color': '#3C8CF8'}}
                        ]},
                        {'id': 'dd2e7a97-1622-4521-a807-f29960218785', 'name': 'Create concept', 'order': 3, 'tasks': [
                            {'id': '9c17a6c8-ce8c-4426-8693-a0965ff0fe69', 'name': 'Create concept', 'color': '#F1C232', 'from': new Date(2013, 9, 10, 8, 0, 0), 'to': new Date(2013, 9, 16, 18, 0, 0), 'est': new Date(2013, 9, 8, 8, 0, 0), 'lct': new Date(2013, 9, 18, 20, 0, 0),
                                'progress': 100}
                        ]},
                        {'id': 'eede0c9a-6777-4b55-9359-1eada309404e', 'name': 'Finalize concept', 'order': 4, 'tasks': [
                            {'id': '30b8f544-5a45-4357-9a72-dd0181fba49f', 'name': 'Finalize concept', 'color': '#F1C232', 'from': new Date(2013, 9, 17, 8, 0, 0), 'to': new Date(2013, 9, 18, 18, 0, 0),
                                'progress': 100}
                        ]},
                        {'id': 'b5318fd9-5d70-4eb1-9c05-65647b9aefe6','group':'team1', 'name': 'Sprint 1', 'order': 5, 'tasks': [
                            {'id': 'd1fdf100-534c-4198-afb9-7bcaef0696f0', 'name': 'Product list view', 'color': '#F1C232', 'from': new Date(2013, 9, 21, 8, 0, 0), 'to': new Date(2013, 9, 25, 15, 0, 0),
                                'progress': 25}
                        ]},
                        {'id': 'cfb29cd5-1737-4027-9778-bb3058fbed9c','group':'team1', 'name': 'Sprint 2', 'order': 6, 'tasks': [
                            {'id': '57638ba3-dfff-476d-ab9a-30fda1e44b50', 'name': 'Order basket', 'color': '#F1C232', 'from': new Date(2013, 9, 28, 8, 0, 0), 'to': new Date(2013, 10, 1, 15, 0, 0)}
                        ]},
                        {'id': 'df9bb83f-e9de-4cbe-944e-36aec6db53cc','group':'team1', 'name': 'Sprint 3', 'order': 7, 'tasks': [
                            {'id': '192adc6e-ab17-4cd1-82d8-4a5e7525b169', 'name': 'Checkout', 'color': '#F1C232', 'from': new Date(2013, 10, 4, 8, 0, 0), 'to': new Date(2013, 10, 8, 15, 0, 0)}
                        ]},
                        {'id': '48cbc052-1fd5-4262-a05f-97dad7337876', 'name': 'Sprint 4', 'order': 8, 'tasks': [
                            {'id': '431dc7be-b61b-49a0-b26d-7ab5dfcadd41', 'name': 'Login&Singup and admin view', 'color': '#F1C232', 'from': new Date(2013, 10, 11, 8, 0, 0), 'to': new Date(2013, 10, 15, 15, 0, 0)}
                        ]},
                        {'id': '34473cc4-5ee5-4953-8289-98779172129e', 'name': 'Setup server', 'order': 9, 'tasks': [
                            {'id': '43eb6d19-6402-493c-a281-20e59a6fab6e', 'name': 'HW', 'color': '#F1C232', 'from': new Date(2013, 10, 18, 8, 0, 0), 'to': new Date(2013, 10, 18, 12, 0, 0)}
                        ]},
                        {'id': '73cae585-5b2c-46b6-aeaf-8cf728c894f7', 'name': 'Config server', 'order': 10, 'tasks': [
                            {'id': '8dbfda29-e775-4fa3-87c1-103b085d52ee', 'name': 'SW / DNS/ Backups', 'color': '#F1C232', 'from': new Date(2013, 10, 18, 12, 0, 0), 'to': new Date(2013, 10, 21, 18, 0, 0)}
                        ]},
                        {'id': '41cae585-ad2c-46b6-aeaf-8cf728c894f7', 'name': 'Deployment', 'order': 11, 'tasks': [
                            {'id': '2dbfda09-e775-4fa3-87c1-103b085d52ee', 'name': 'Depl. & Final testing', 'color': '#F1C232', 'from': new Date(2013, 10, 21, 8, 0, 0), 'to': new Date(2013, 10, 22, 12, 0, 0)}
                        ]},
                        {'id': '33e1af55-52c6-4ccd-b261-1f4484ed5773', 'name': 'Workshop', 'order': 12, 'tasks': [
                            {'id': '656b9240-00da-42ff-bfbd-dfe7ba393528', 'name': 'On-side education', 'color': '#F1C232', 'from': new Date(2013, 10, 24, 9, 0, 0), 'to': new Date(2013, 10, 25, 15, 0, 0)}
                        ]},
                        {'id': 'bffa16c6-c134-4443-8e6e-b09410c37c9f', 'name': 'Content', 'order': 13, 'tasks': [
                            {'id': '2f4ec0f1-cd7a-441a-8288-e788ec112af9', 'name': 'Supervise content creation', 'color': '#F1C232', 'from': new Date(2013, 10, 26, 9, 0, 0), 'to': new Date(2013, 10, 29, 16, 0, 0)}
                        ]},
                        {'id': 'ec0c5e31-449f-42d0-9e81-45c66322b640', 'name': 'Documentation', 'order': 14, 'tasks': [
                            {'id': 'edf2cece-2d17-436f-bead-691edbc7386b', 'name': 'Technical/User documentation', 'color': '#F1C232', 'from': new Date(2013, 10, 26, 8, 0, 0), 'to': new Date(2013, 10, 28, 18, 0, 0)}
                        ]}
                    ]};
            },
            getSampleTimespans: function() {
                return {
                    'timespan1': [
                        {
                            id: '1',
                            from: new Date(2013, 9, 21, 8, 0, 0),
                            to: new Date(2013, 9, 25, 15, 0, 0),
                            name: 'Sprint 1 Timespan'
                            //priority: undefined,
                            //classes: [], //Set custom classes names to apply to the timespan.
                            //data: undefined
                        }
                    ]
                };
            }
        };
    })
;
