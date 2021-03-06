const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/', (req, res, next) => {
    db.all(
        'SELECT * FROM Issue',
        (err, issues) => {
            if(err) {
                next(err);
            } else {
                return res.status(200).json({issues: issues});
            }
        }
    )
});

issuesRouter.param('issueId', (req, res, next, id) => {
    db.get(
        'SELECT * FROM Issue WHERE id=$id',
        {$id: id},
        (err, issue) => {
            if(err) {
                next(err);
            } else if(issue) {
                next();
            } else {
                res.status(404).send();
            }
        }
    )
})

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    // first check and get artist with the provided artist ID
    db.get(
        'SELECT * FROM Artist WHERE id=$artistId',
        {
            $artistId: artistId
        },
        (err, artist) => {
            if (err) {
                next(err);
            } else {
                if (!name || !issueNumber || !publicationDate || !artist) {
                    return res.status(400).send();
                }

                // if all required fields exist, we insert the new data into the table
                db.run(
                    'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)', {
                        $name: name,
                        $issueNumber: issueNumber,
                        $publicationDate: publicationDate,
                        $artistId: artistId,
                        // can use params seriesId here because the routes are merged (see line 8 in series.js file)
                        $seriesId: req.params.seriesId
                    },
                    function (err) {
                        if (err) {
                            next(err);
                        } else {
                            db.get(
                                'SELECT * FROM Issue WHERE id=$issueId', {
                                    $issueId: this.lastID
                                },
                                (err, issue) => {
                                    if (err) {
                                        next(err);
                                    } else {
                                        res.status(201).json({issue: issue});
                                    }
                                }
                            )
                        }
                    }
                )
            }
        }
    )
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    db.get(
        'SELECT * FROM Artist WHERE id=$artistId',
        {
            $artistId: artistId
        },
        (err, artist) => {
            if (err) {
                next(err);
            } else {
                if (!name || !issueNumber || !publicationDate || !artist) {
                    return res.status(400).send();
                }

                // if all required fields exist, we insert the new data into the table
                db.run(
                    'UPDATE Issue SET name=$name, issue_number=$issueNumber, publication_date=$publicationDate, artist_id=$artistId WHERE issue_id=$issueId', {
                        $name: name,
                        $issueNumber: issueNumber,
                        $publicationDate: publicationDate,
                        $artistId: artistId,
                        $issueId: req.params.issueId
                    },
                    function (err) {
                        if (err) {
                            next(err);
                        } else {
                            db.get(
                                'SELECT * FROM Issue WHERE id=$issueId', {
                                    $issueId: req.params.issueId
                                },
                                (err, issue) => {
                                    if (err) {
                                        next(err);
                                    } else {
                                        res.status(200).json({issue: issue});
                                    }
                                }
                            )
                        }
                    }
                )
            }
        }
    )
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(
        'DELETE FROM Issue WHERE id=$issueId',
        {$issueId: req.params.issueId},
        (err) => {
            if(err) {
                next(err);
            } else {
                res.status(204).send();
            }
        }
    )
})

module.exports = issuesRouter;