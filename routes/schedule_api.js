const schedule = require("../database/schedule");

function make_time_slice(dates, start_time, end_time) {
    var slots = [];
    min30 = 1000 * 60 * 30;

    for (day of dates) {
        console.log(day);
        let start = new Date(day + "Z" + start_time + ":00");
        let end = new Date(day + "Z" + end_time + ":00");

        for (let q = start; q < end; q = new Date(q.getTime() + min30)) {
            slots.push(q);
        }
    }
    return slots;
}


module.exports = function (app, Schedule) {
    /* GET APIS */
    // RETURNS A LIST OF SCHEDULES CONTAINING USERID
    app.get('/api/schedules/userId/:userId', function (request, result) {
        Schedule.find({ 'members._id': request.params.userId }, function (err, schedules) {
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
    app.post('/api/schedules', function (request, result) {
        // set schedule values
        var schedule = new Schedule();
        schedule.title = request.body.title;    // essential
        if (request.body.passwd) { schedule.passwd = request.body.passwd; }
        schedule.members = [];
        const timeSlice = make_time_slice(request.body.days, request.body.start_time, request.body.end_time);
        timeSlice.forEach(
            elem => {
                var timeslot = new Timeslot();
                timeslot.start = elem;
                timeslot.members = [];
                schedule.timeslots.put(timeslot);
            }
        );

        schedule.save(function (err) {
            if (err) {
                console.error(err);
                result.json({ result: 0 });
                return;
            }

            result.json({ result: 1 });
        });
        result.end();
    });


    /* PUT APIS */
    app.put('api/schedules/:schedule_id', function (request, result) {
        result.end();
    });


    /* DELETE APIS */
    app.delete('/api/schedules/:schedule_id', function (request, result) {
        // Profile.remove({ _id: request.params.userId }, function (err, output) {
        //     if (err) {
        //         return result.status(500).json({ error: "database failure" });
        //     }

        //     result.status(204).end();
        // })
        result.end();
    });
}