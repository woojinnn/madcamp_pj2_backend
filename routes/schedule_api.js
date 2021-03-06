const mongoose = require("mongoose")
const profile = require("../database/profile")
const timeslot = require("../database/timeslot")

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
    // GET ALL SCHEDULES
    app.get('/api/schedules', function (request, result) {
        Schedule.find()
            .exec(function (err, schedules) {
                if (err) return result.status(500).send({ error: 'database failure' })
                result.json(schedules)
            })
    })

    // RETURNS A LIST OF SCHEDULES CONTAINING USERID
    app.get('/api/schedules/userId/:userId', function (request, result) {
        Schedule.find(function (err, schedules) {
            console.log(schedules)
            if (err)
                return result.status(500).send({ error: 'database failure' })

            let filtered = []
            schedules.forEach(
                (elem) => {
                    const members = elem["members"]
                    members.forEach(
                        (mem) => {
                            if (mem["userId"] === request.parmas.userId) {
                                filtered.push(sch)
                            }
                        }
                    )
                }
            )
            result.json(filtered)
        })
    })

    // RETURNS LIST OF SCHEDFULES CORRESPONDING TO THE TITLE
    app.get('/api/schedules/title/:title', function (request, result) {
        Schedule.find({ title: request.params.title }, function (err, schedules) {
            if (err) return result.status(500).send({ error: 'database failure' })
            result.json(schedules)
        })
    })

    // RETURN TIMESLOT CORRESPONDING TO ID
    app.get('/api/timeslots/:timeslotId', function (request, result) {
        Timeslot.findOne({ _id: request.params.timeslotId }, function (err, timeslot) {
            if (err) return result.status(500).send({ error: 'database failure' })
            result.json(timeslot)
        })
    })

    // RETURNS SCHEDULE CORRESPONDING TO THE SCHEDULEID
    app.get('/api/schedules/scheduleId/:scheduleId', function (request, result) {
        console.log(request.params.scheduleId)
        Schedule.findOne({ _id: request.params.scheduleId }, function (err, schedule) {
            console.log(schedule)
            if (err) return result.status(500).json({ error: err })
            if (!schedule) return result.status(404).json({ error: 'schedule not found' })
            result.json(schedule)
        })
    })

    /* POST APIS */
    // CREATE SCHEDULE
    app.post('/api/schedules', function (request, result) {
        // set schedule values
        let schedule = new Schedule()
        schedule.title = request.body.title
        schedule.members = []
        schedule.days = request.body.days
        schedule.start_time = request.body.start_time
        schedule.end_time = request.body.end_time
        if (request.body.passwd) { schedule.passwd = request.body.passwd }

        const timeSlice = make_time_slice(request.body.days, request.body.start_time, request.body.end_time)
        let ts_list = []
        timeSlice.forEach(
            elem => {
                let timeslot = new Timeslot()
                timeslot.start = elem
                timeslot.members = []
                timeslot.save()
                ts_list.push(timeslot._id)
            }
        )
        schedule.timeslots = ts_list

        schedule.save().then(result.json({ _id: schedule["_id"] }))
    })


    /* PUT APIS */
    app.put('/api/schedules/:scheduleId', function (request, result) {
        let available_dic = {}
        request.body.contents.forEach(
            elem => {
                available_dic[generate_date(elem.day, elem.time)] = elem.available
            }
        )

        profile.findOne({ userId: request.body.userId }).exec(
            function (err, user) {

                const user_id = mongoose.Types.ObjectId(user["_id"])

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

                        let contains_member = false
                        schedule["members"].forEach(
                            (mem) => {
                                if (mem["_id"].equals(user_id)) {
                                    contains_member = true
                                }
                            }
                        )
                        if (!contains_member) {
                            // This member is initially introduced
                            Schedule.updateOne({ _id: schedule["_id"] }, { $push: { members: user_id } }, function (err, res) {
                                if (err) console.log(err)
                            })
                        }

                        const timeslots = schedule["timeslots"]
                        for (let timeslot of timeslots) {
                            let contains_id = false
                            timeslot["members"].forEach(
                                elem => {
                                    if (elem["_id"].equals(user_id)) {
                                        contains_id = true
                                    }
                                }
                            )

                            if (contains_id &&
                                (available_dic[timeslot.start] === false)) {
                                // timeslot already contains member
                                // and that member isn't available at that time
                                const updated = timeslot.members.filter((elem) => (!elem["_id"].equals(user_id)))
                                Timeslot.updateOne({ _id: timeslot._id }, { $set: { members: updated } }, function (err, res) {
                                    if (err) console.log(err)
                                })
                            } else if (!contains_id &&
                                (available_dic[timeslot.start] === true)) {
                                // timeslot doesn't contain member
                                // and that member is available at that time
                                Timeslot.updateOne({ _id: timeslot._id }, { $push: { members: user_id } }, function (err, res) {
                                    if (err) console.log(err)
                                })
                            }
                        }
                    })
                result.json({ message: 'profile updated' })

            }
        )
    })


    /* DELETE APIS */
    app.delete('/api/schedules/:scheduleId/:userId', function (request, result) {
        const scheduleId = request.params.scheduleId

        if (request.params.userId === "-1") {
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
            Schedule.deleteOne({ _id: request.params.scheduleId }, function (err, output) {
                if (err) {
                    return result.status(500).json({ error: "database failure" })
                }
                return result.status(204).end()
            })
        } else {
            profile.findOne({ userId: request.params.userId }).exec(
                function (err, user) {
                    const userId = mongoose.Types.ObjectId(user["_id"])

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

                            // delete member from schedule list
                            let contains_member = false
                            schedule["members"].forEach(
                                (mem) => {
                                    if (mem["_id"].equals(userId)) {
                                        contains_member = true
                                    }
                                }
                            )
                            if (contains_member) {
                                const filtered_members = schedule["members"].filter((elem) => (!elem["_id"].equals(userId)))
                                Schedule.updateOne({ _id: schedule["_id"] }, { $set: { members: filtered_members } }, function (err, res) {
                                    if (err) console.log(err)
                                })
                            }

                            // delete member in timeslots
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
                })
        }
    })
}