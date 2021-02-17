const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues');
seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all(
        'SELECT * FROM Series',
        (err, series) => {
            if(err) {
                next(err);
            } else {
                return res.status(200).json({series: series});
            }
        }
    )
});

seriesRouter.param('seriesId', (req, res, next, id) => {
    db.get(
        'SELECT * FROM Series WHERE id=$seriesId',
        {$seriesId: id},
        (err, series) => {
            if(err) {
                next(err);
            } else if(series) {
                req.series = series;
                next();
            } else {
                res.status(404).send();
            }
        }
    )
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {
        return res.status(400).send();
    } else {
        db.run(
            'INSERT INTO Series (name, description) VALUES ($name, $description)',
            {
                $name: name,
                $description: description
            },
            function(err) {
                if(err) {
                    next(err);
                } else {
                    db.get(
                        'SELECT * FROM Series WHERE id=$seriesId',
                        {$seriesId: this.lastID},
                        (err, series) => {
                            if(err) {
                                next(err);
                            } else {
                                res.status(201).json({series: series});
                            }
                        }
                    )
                }
            }
        );
    }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {
        return res.status(400).send();
    } else {
        db.run(
            'UPDATE Series SET name=$name, description=$description WHERE id=$seriesId',
            {
                $name: name,
                $description: description,
                $seriesId: req.params.seriesId
            },
            (err) => {
                if(err) {
                    next(err);
                } else {
                    db.get(
                        'SELECT * FROM Series WHERE id=$seriesId',
                        {$seriesId: req.params.seriesId},
                        (err, series) => {
                            if(err) {
                                next(err);
                            } else {
                                res.status(200).json({series: series});
                            }
                        }
                    )
                }
            }
        )
    }
});



module.exports = seriesRouter;