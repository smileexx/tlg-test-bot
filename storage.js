const MongoClient = require('mongodb').MongoClient;
const mongoUri = process.env.MONGO_URI;

const mongoClientOptions = {useNewUrlParser: true, useUnifiedTopology: true};

function Storage() {

    let images = [];
    let gifs = [];

    function fn() {
        return false;
    };

    let users = [];

    this.loadUsers = function (callback) {
        callback = callback || fn;

        if (users && users.length > 0) {
            callback(users);
            return 0;
        }
        // Connect to mongoDB mLab server
        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            let cursor = db.collection('users').find({});
            cursor.toArray().then((res) => {
                users = res;
                client.close();
                callback(users);
            });
        }).catch((err) => {
            console.warn(err);
        });
    };

    this.addUser = function (newUser, callback) {
        callback = callback || fn;

        for (let i in users) {
            if (users[i].id == newUser.id) {
                callback();
                return 0;
            }
        }

        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            db.collection('users').findOne({
                id: newUser.id
            }).then((data) => {
                console.log(data);
                if (!data) {
                    db.collection('users').insertOne(newUser, (error, result) => {
                        console.log('New', result.ops);
                        client.close();
                        users.push(result.ops[0]);
                        callback(result.ops[0]);
                    });
                } else {
                    client.close();
                    callback();
                }
            });
        }).catch((err) => {
            console.warn(err);
        });
    };


    /**
     * Add single Image to DB
     * @param newImage
     * @param callback
     */
    this.addImage = function (newImage, callback) {
        callback = callback || fn;

        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            // findAndModify
            db.collection('images').updateOne(
                {id: newImage.id},
                {$setOnInsert: newImage},
                {upsert: true}
            ).then(() => {
                callback()
            }).catch((err) => {
                console.warn(err);
            });
        }).catch((err) => {
            console.warn(err);
        });
    };


    /**
     * Add butch of images to DB
     * @param imagesList
     * @param callback
     */
    this.addImages = function (imagesList, callback) {
        try {
            callback = callback || fn;

            let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

            mongoPromise.then((client) => {
                let db = client.db();
                db.collection('images').insertMany(
                    imagesList,
                    {ordered: false}
                ).then((res) => {
                    client.close();
                    callback(res);
                }).catch((err) => {
                    client.close();
                    callback(null);
                });
            }).catch((err) => {
                console.warn(err);
            });


        } catch (e) {
            console.warn(e);
        }
    };


    /**
     * Add butch of gifs to DB
     * @param gifsList
     * @param callback
     */
    this.addGifs = function (gifsList, callback) {
        try {
            callback = callback || fn;

            let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

            mongoPromise.then((client) => {
                let db = client.db();
                db.collection('gifs').insertMany(
                    gifsList,
                    {ordered: false}
                ).then((res) => {
                    client.close();
                    callback(res);
                }).catch((err) => {
                    client.close();
                    callback(null);
                });
            }).catch((err) => {
                console.warn(err);
            });
        } catch (e) {
            console.warn(e);
        }
    };


    /**
     * Update image shown mark
     * @param newImage
     * @param callback
     */
    this.updateImage = function (newImage, callback) {
        callback = callback || fn;

        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            db.collection('images').updateOne(
                {id: newImage.id},
                {$set: {shown: newImage.shown}}
            ).then(() => {
                client.close();
                callback()
            }).catch((err) => {
                client.close();
                console.warn(err);
            });
        }).catch((err) => {
            console.warn(err);
        });
    };


    /**
     * Update image shown mark
     * @param newImage
     * @param callback
     */
    this.updateGif = function (gif, callback) {
        callback = callback || fn;

        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            db.collection('gifs').updateOne(
                {id: gif.id},
                {$set: {shown: gif.shown}}
            ).then(() => {
                client.close();
                callback()
            }).catch((err) => {
                client.close();
                console.warn(err);
            });
        }).catch((err) => {
            console.warn(err);
        });
    };


    /**
     * Get list of images
     * @param callback
     */
    this.loadImages = function (callback) {
        callback = callback || fn;

        // Connect to mongoDB mLab server
        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            let cursor = db.collection('images').find({shown: {$in: [null, false]}}).sort({_id: -1}).limit(100);
            // let newImages = [];
            cursor.toArray().then((res) => {
                client.close();
                callback(res);
            }).catch((err) => {
                client.close();
                console.warn(err);
                callback(null, err.message);
            });
        }).catch((err) => {
            console.warn(err);
            callback(null, err.message);
        });
    };


    /**
     * Get random image
     * @param callback
     */
    this.loadRandomImages = function (callback) {
        callback = callback || fn;
        if( images.length ) {
            callback(images.pop());
            console.log('Images ', images.length);
            return 1;
        } else {
            // Connect to mongoDB mLab server
            let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

            mongoPromise.then((client) => {
                let db = client.db();
                // let cursor = db.collection('images').find({shown: {$in: [null, false]}}).sort( { _id: -1 } ).limit( 100 );
                let cursor = db.collection('images').aggregate([
                    {$match: {shown: {$in: [null, false]}}},
                    {$sample: {size: 50}}
                ]);
                // let newImages = [];
                cursor.toArray().then((res) => {
                    client.close();
                    if (res.length) {
                        images = res;
                        callback(res.pop());
                    } else {
                        callback(null);
                    }
                }).catch((err) => {
                    client.close();
                    console.warn(err);
                    callback(null, err.message);
                });
            }).catch((err) => {
                console.warn(err);
                callback(null, err.message);
            });
        }
    };

    /**
     * Get random image
     * @param callback
     */
    this.loadRandomGif = function (callback) {
        callback = callback || fn;
        if( gifs.length ) {
            callback(gifs.pop());
            console.log('Gifs ', gifs.length);
            return 1;
        } else {
            // Connect to mongoDB mLab server
            let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

            mongoPromise.then((client) => {
                let db = client.db();
                // let cursor = db.collection('gifs').find({shown: {$in: [null, false]}}).sort( { _id: -1 } ).limit( 100 );
                let cursor = db.collection('gifs').aggregate([
                    {$match: {shown: {$in: [null, false]}}},
                    {$sample: {size: 15}}
                ]);
                // let newgifs = [];
                cursor.toArray().then((res) => {
                    client.close();
                    if (res.length) {
                        gifs = res;
                        callback(res.pop());
                    } else {
                        callback(null);
                    }
                }).catch((err) => {
                    client.close();
                    console.warn(err);
                    callback(null, err.message);
                });
            }).catch((err) => {
                console.warn(err);
                callback(null, err.message);
            });
        }
    };

    this.getUsers = function () {
        return users;
    };

    this.saveState = function (state) {

        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            db.collection('statistic').updateOne(
                {date: state.date},
                {$set: state},
                {upsert: true}
            ).then(() => {
                client.close();
                return true;
            }).catch((err) => {
                client.close();
                console.warn(err);
                return false;
            });
        }).catch((err) => {
            console.warn(err);
            return false;
        });
    };

    this.retriveState = function (date, callback ) {
        callback = callback || fn;

        // Connect to mongoDB mLab server
        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            let promis = db.collection('statistic').findOne({"date": date});
            promis.then(state => {
                client.close();
                callback(state);
            }).catch(err => {
                client.close();
                console.warn(err);
            });

        }).catch((err) => {
            console.warn(err);
        });
    };


    /**
     * Add media
     * @param doc
     */
    this.addMedia = function (doc, callback) {
        callback = callback || fn;
        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);
        mongoPromise.then((client) => {
            let db = client.db();
            db.collection('content').insertOne(doc).then((res) => {
                client.close();
                callback(res.ops[0]);
                return true;
            }).catch((err) => {
                client.close();
                callback(null, err.toString());
                return false;
            });
        }).catch((err) => {
            console.warn(err.toString());
            callback(null, err.toString());
            return false;
        });
    };

    this.getMedia = function ( callback ) {
        callback = callback || fn;

        // Connect to mongoDB mLab server
        let mongoPromise = MongoClient.connect(mongoUri, mongoClientOptions);

        mongoPromise.then((client) => {
            let db = client.db();
            let promis = db.collection('content').find({}).toArray();
            promis.then(list => {
                client.close();
                callback(list);
            }).catch(err => {
                client.close();
                console.warn(err);
                callback(null, err);
            });

        }).catch((err) => {
            console.warn(err);
            callback(null, err);
        });
    };
};

module.exports.Storage = new Storage();
