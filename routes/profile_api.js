module.exports = function (app, Profile) {
    /* GET APIS */
    // GET SINGLE PROFILE WITH USER ID
    app.get('/api/profiles/userId/:userId', function (request, result) {
        Profile.findOne({ _id: request.params.userId }, function (err, profile) {
            if (err) return result.status(500).json({ error: err })
            if (!profile) return result.status(404).json({ error: 'proifle not found' })
            console.log(profile)
            result.json(profile)
        })
    })

    // GET PROFILE BY NAME
    app.get('/api/profiles/name/:name', function (request, result) {
        Profile.find({ name: request.params.name }, function (err, profiles) {
            if (err) return result.status(500).json({ error: err })
            if (profiles.length === 0) return result.status(404).json({ error: 'profile not found' })

            result.json(profiles)
        })
    })

    /* POST APIS */
    // CREATE PROFILE
    app.post('/api/profiles', function (request, result) {
        Profile.findOne({ userId: request.body.userId }, function (err, profile) {
            if (err) return result.status(500).json({ error: err })

            if (profile) {
                // profile already exists
                console.log("Already exists")
                return result.json({ result: 1 })
            }

            if (!profile) {
                // new profile
                var profile = new Profile()
                profile.userId = request.body.userId
                profile.name = request.body.name
                if (request.body.imageUrl) { profile.imageUrl = request.body.imageUrl }
                if (request.body.email) { profile.email = request.body.email }

                profile.save(function (err) {
                    if (err) {
                        console.error(err)
                        return result.json({ result: 0 })
                    }

                    return result.json({ result: 1 })
                })
            }

        })
    })

    /* PUT APIS */
    // UPDATE PROFILE WITH USER_ID
    app.put('/api/profiles/:userId', function (request, result) {
        Profile.findOne({ userId: request.params.userId }, function (err, profile) {
            if (err) return result.status(500).json({ error: 'database failure' });
            if (!profile) return result.status(404).json({ error: 'Profile not found' });

            if (request.body.name) { profile.name = request.body.name; }
            if (request.body.imageUrl) { profile.imageUrl = request.body.imageUrl; }
            if (request.body.email) { profile.email = request.body.email; }

            profile.save(function (err) {
                if (err) {
                    result.status(500).json({ error: 'failed to update' });
                }

                result.json({ message: 'profile updated' });
            });

        });

    });

    /* DELETE APIS */
    // DELETE PROFILE
    app.delete('/api/profiles/:userId', function (request, result) {
        Profile.remove({ userId: request.params.userId }, function (err, output) {
            if (err) {
                return result.status(500).json({ error: "database failure" });
            }

            result.status(204).end();
        })
    });

}