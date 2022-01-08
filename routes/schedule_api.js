const mongoose = require("mongoose")

function generate_date(day, time) {
    return new Date(day + "Z" + time + ":00")
}

function make_time_slice(dates, start_time, end_time) {
    let slots = []
    const min30 = 1000 * 60 * 30

    for (day of dates) {
        let start = generate_date(day, start_time)
        let end = generate_date(day, end_time)

        for (let q = start; q < end; q = new Date(q.getTime() + min30)) {
            slots.push(q)
        }
    }
    return slots
}


module.exports = function (app, Schedule, Timeslot) {
    /* GET APIS */
    // RETURNS A LIST OF SCHEDULES CONTAINING USERID
    app.get('/api/schedules/userId/:userId', function (request, result) {
        Schedule.find({ 'members._id': request``.params.userId }, function (err, schedules) {
            if (err) return result.status(500).send({ error: 'database failure' })
            result.json(schedules)
        })
    });

    // RETURNS LIST OF SCHEDFULES CORRESPONDING TO THE TITLE
    app.get('/api/schedules/title/:title', function (request, result) {
        Schedule.find({ title: request.params.title }, function (err, schedules) {
            if (err) return result.status(500).send({ error: 'database failure' })
            result.json(schedules);
        })
    });

    // RETURNS SCHEDULE CORRESPONDING TO THE SCHEDULEID
    app.get('/api/schedules/scheduleId/:scheduleId', function (request, result) {
        console.log(request.params.scheduleId)
        Schedule.findOne({ _id: request.params.scheduleId }, function (err, schedule) {
            console.log(schedule)
            if (err) return result.status(500).json({ error: err })
            if (!schedule) return result.status(404).json({ error: 'schedule not found' })
            result.json(schedule)
        });
    });

    /* POST APIS */
    // CREATE SCHEDULE
    app.post('/api/schedules', function (request, result) {
        // set schedule values
        let schedule = new Schedule()
        schedule.title = request.body.title
        schedule.members = []
        if (request.body.passwd) { schedule.passwd = request.body.passwd; }

        const timeSlice = make_time_slice(request.body.days, request.body.start_time, request.body.end_time);
        let ts_list = []
        timeSlice.forEach(
            elem => {
                let timeslot = new Timeslot()
                timeslot.start = elem
                timeslot.members = []
                timeslot.save()
                console.log(timeslot)
                console.log(timeslot._id)
                ts_list.push(timeslot._id)
            }
        )
        schedule.timeslots = ts_list;

        schedule.save().then(result.json({ result: 1 }))
    })


    /* PUT APIS */
    app.put('/api/schedules/:scheduleId', function (request, result) {
        let available_dic = {}
        request.body.contents.forEach(
            elem => {
                available_dic[generate_date(elem.day, elem.time)] = elem.available
            }
        )

        const userId = mongoose.Types.ObjectId(request.body.userId)

        Schedule.findOne({ _id: request.params.scheduleId })
            .populate({
                path: 'timeslots',
                populate: {
                    path: 'members'
                }
            })
            .exec(function (err, schedule) {
                if (err) return result.status(500).json({ error: 'database failure' })
                if (!schedule) return result.status(404).json({ error: 'Schedule not found' })

                const timeslots = schedule["timeslots"]

                for (let timeslot of timeslots) {
                    let contains_id = false
                    timeslot.members.forEach(
                        elem => {
                            if (elem["_id"].equals(userId)) {
                                contains_id = true
                            }
                        }
                    )

                    if (contains_id &&
                        (available_dic[timeslot.start] === false)) {
                        // timeslot already contains member
                        // and that member isn't available at that time
                        const updated = timeslot.members.filter((elem) => (!elem["_id"].equals(userId)))
                        Timeslot.updateOne({ _id: timeslot._id }, { $set: { members: updated } }, function (err, res) {
                            if (err) console.log(err);
                        })
                    } else if (!contains_id &&
                        (available_dic[timeslot.start] === true)) {
                        // timeslot doesn't contain member
                        // and that member is available at that time
                        Timeslot.updateOne({ _id: timeslot._id }, { $push: { members: userId } }, function (err, res) {
                            if (err) console.log(err);
                        })
                    }
                }
            })
        result.json({ message: 'profile updated' });
    })


    /* DELETE APIS */
    app.delete('/api/schedules/:scheduleId', function (request, result) {
        const scheduleId = request.params.scheduleId
        const userId = mongoose.Types.ObjectId(request.body.userId)

        if (request.body.userId === -1) {
            Schedule.findOne({ _id: scheduleId }).
                exec(function (err, schedule) {
                    if (err) return result.status(500).json({ error: 'database failure' })
                    if (!schedule) return result.status(404).json({ error: 'Schedule not found' })

                    const timeslots = schedule["timeslots"]
                    for (let timeslot of timeslots) {
                        Timeslot.remove({ _id: timeslot["_id"] }, function (err, output) {
                            if (err) return result.status(500).json({ error: "timeslot failure" })
                        })
                    }
                })

            // Delete whole schedule
            Schedule.remove({ _id: request.params.scheduleId }, function (err, output) {
                if (err) {
                    return result.status(500).json({ error: "database failure" })
                }
                return result.status(204).end()
            })
        } else {
            // Delete user in scheduleId
            Schedule.findOne({ _id: scheduleId })
                .populate({
                    path: 'timeslots',
                    populate: {
                        path: 'members'
                    }
                })
                .exec(function (err, schedule) {
                    if (err) return result.status(500).json({ error: 'database failure' })
                    if (!schedule) return result.status(404).json({ error: 'Schedule not found' })

                    const timeslots = schedule["timeslots"]

                    for (let timeslot of timeslots) {
                        let contains_id = false
                        timeslot.members.forEach(
                            elem => {
                                if (elem["_id"].equals(userId)) {
                                    contains_id = true
                                }
                            }
                        )

                        if (contains_id) {
                            const updated = timeslot.members.filter((elem) => (!elem["_id"].equals(userId)))
                            Timeslot.updateOne({ _id: timeslot._id }, { $set: { members: updated } }, function (err, res) {
                                if (err) console.log(err)
                            })
                        }
                    }
                    return result.status(204).end()
                })
        }
    })
}