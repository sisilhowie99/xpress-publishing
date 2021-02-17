const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
    // retrieve all entries from Artist table where is_currently_employed equals to 1
    db.all(
        'SELECT * FROM Artist WHERE is_currently_employed=1',
        (err, artists) => {
            if(err) {
                next(err);
            } else {
                res.status(200).json({artists: artists});
            }
        }
    )
});

artistsRouter.param('artistId', (req, res, next, id) => {
    // retrieve all artists whose ID match the param
    db.get(
        'SELECT * FROM Artist WHERE id=$id',
        {$id: id},
        (err, artist) => {
            // if any error encountered, pass it to the next middleware
            if(err) {
                next(err);
            } else if(artist) {
                // if there's an artist with the ID, attach it to the req object with artist property
                req.artist = artist;
                next();
            } else {
                // otherwise send an error response
                res.status(404).send();
            }
        }
    );

});

artistsRouter.get('/:artistId', (req, res, next) => {
    // will automatically use the logic from the .param's callback
    // then will send the response as json object
    res.status(200).json({artist: req.artist});
});

artistsRouter.post('/', (req, res, next) => {
    // checks if all the required fields exist
    const name = req.body.artist.name;
    const dob = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    // set the employment status value if none already set
    const currentlyEmployed = req.body.artist.is_currently_employed == 0 ? 0 : 1;

    // if any of the required fields aren't present, return an error
    if(!name || !dob || !biography) {
        return res.status(400).send();
    };

    // otherwise run a query to insert a new artist with the provided data from above (request obj)
    db.run(
        'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dob, $bio, $isCurrentlyEmployed)',
        {
            $name: name,
            $dob: dob,
            $bio: biography,
            $isCurrentlyEmployed: currentlyEmployed
        },
        function(err) {
            if(err) {
                next(err);
            } else {
                // if no error found, find and return the newly created artist
                // use lastID to match the artist 
                db.get(
                    'SELECT * FROM Artist WHERE id=$lastId',
                    {$lastId: this.lastID},
                    (err, artist) => {
                        if(err) {
                            next(err);
                        } else {
                            res.status(201).json({artist: artist});
                        }
                    }
                );
            }
        }
    )
});

artistsRouter.put('/:artistId', (req, res, next) => {
    // similar to post route but to update the entry
    const name = req.body.artist.name;
    const dob = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const currentlyEmployed = req.body.artist.is_currently_employed == 0 ? 0 : 1;

    if (!name || !dob || !biography) {
        return res.status(400).send();
    };

    db.run(
        'UPDATE Artist SET name=$name, date_of_birth=$dob, biography=$bio, is_currently_employed=$isCurrentlyEmployed WHERE id=$artistId',
        {
            $name: name,
            $dob: dob,
            $bio: biography,
            $isCurrentlyEmployed: currentlyEmployed,
            $artistId: req.params.artistId
        },
        (err) => {
            if(err) {
                next(err);
            } else {
                db.get(
                    'SELECT * FROM Artist WHERE id=$id',
                    {
                        $id: req.params.artistId
                    },
                    (err, artist) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).json({
                                artist: artist
                            });
                        }
                    }
                );
            }
        }
    )
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    // to 'delete' an artist, will make the employment status = 0
    db.run(
        'UPDATE Artist SET is_currently_employed=0 WHERE id=$artistId',
        {$artistId: req.params.artistId},
        (err) => {
            if(err) {
                next(err);
            } else {
                db.get(
                    'SELECT * FROM Artist WHERE id=$artistId',
                    {$artistId: req.params.artistId},
                    (err, artist) => {
                        if(err) {
                            next(err);
                        } else {
                            res.status(200).json({artists: artist});
                        }
                    }
                )
            }
        }
    )
})


module.exports = artistsRouter;