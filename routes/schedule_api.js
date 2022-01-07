function make_time_slice(dates, start_time, end_time) {
    var slots = [];
    min30 = 1000 * 60 * 30;

    for (day of dates) {
        let start = new Date(day + "Z" + start_time + ":00");
        let end = new Date(day + "Z" + end_time + ":00");

        for (let q = start; q < end; q = new Date(q.getTime() + min30)) {
            slots.push(q);
        }
    }
    return slots;
}


module.exports = function (app, Schedule, Timeslot) {
    /* GET APIS */
    // RETURNS A LIST OF SCHEDULES CONTAINING USERID
    app.get('/api/schedules/userId/:userId', function (request, result) {
        Schedule.find({ 'members._id': request``.params.userId }, function (err, schedules) {
            if (err) return result.status(500).send({ error: 'database failure' });
            result.json(schedules);
        })
    });

    // RETURNS LIST OF SCHEDFULES CORRESPONDING TO THE TITLE
    app.get('api/schedules/title/:title', function (request, result) {
        Schedule.find({ title: request.params.title }, function (err, schedules) {
            if (err) return result.status(500).send({ error: 'database failure' });
            result.json(schedules);
        })
    });

    // RETURNS SCHEDULE CORRESPONDING TO THE SCHEDULEID
    app.get('api/schedules/scheduleId/:scheduleId', function (request, result) {
        Schedule.findOne({ _id: request.params.scheduleId }, function (err, schedule) {
            if (err) return result.status(500).json({ error: err });
            if (!schedule) return result.status(404).json({ error: 'schedule not found' });
            res.json(schedule);
        });
    });

    /* POST APIS */
    // CREATE SCHEDULE
    app.post('/api/schedules', (request, result) => {
        // set schedule values
        let schedule = new Schedule();
        schedule.title = request.body.title;
        schedule.members = [];
        if (request.body.passwd) { schedule.passwd = request.body.passwd; }
        schedule.members = [];
        const timeSlice = make_time_slice(request.body.days, request.body.start_time, request.body.end_time);
        var ts_list = [];
        timeSlice.forEach(
            elem => {
                var timeslot = new Timeslot();
                timeslot.start = elem;
                timeslot.members = [];
                ts_list.push(timeslot._id);
                timeslot.save(function (err) {
                    if (err) {
                        console.error(err);
                        result.json({ result: 0 });
                        return;
                    }
                });
            }
        );
        schedule.timeslots = ts_list;
        console.log(schedule);

        schedule.save(function (err) {
            if (err) {
                console.error(err);
                result.json({ result: 0 });
                return;
            }

            result.json({ result: 1 });
        });
    });


    /* PUT APIS */
    app.put('api/schedules/:scheduleId', function (request, result) {
        // TODO
        // Schedule.findOne({ _id: request.params.scheduleId }, function (err, schedule) {
        //     console.log(schedule);
        //     if (err) return result.status(500).json({ error: 'database failure' });
        //     if (!schedule) return result.status(404).json({ error: 'Schedule not found' });

        //     if (request.body.name) { profile.name = request.body.name; }
        //     if (request.body.imageUrl) { profile.imageUrl = request.body.imageUrl; }
        //     if (request.body.email) { profile.email = request.body.email; }
        //     if (request.body.gender) { profile.gender = request.body.gender; }
        //     if (request.body.age) { profile.age = request.body.age; }

        //     schedule.save(function (err) {
        //         if (err) {
        //             result.status(500).json({ error: 'failed to update' });
        //         }

        //         result.json({ message: 'schedule updated' });
        //     });

        // });
    });


    /* DELETE APIS */
    app.delete('/api/schedules/:scheduleId', function (request, result) {
        if (request.body.userId === -1) {
            // Delete whole schedule
            Schedule.remove({ _id: request.parmas.scheduleId }, function (err, output) {
                if (err) {
                    return result.status(500).json({ error: "database failure" });
                }
                return result.status(204).end();
            });
        } else {
            // Delete user in scheduleId
        }
    });
}