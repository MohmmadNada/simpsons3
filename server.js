'use strict'; //151251 express cors pg superagent method-override ejs dotenv 
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverride = require('method-override');
const { pipe } = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();

const client = new pg.Client(process.env.DATABASE_URL)
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(cors());
//--------------------------------------------------
app.get('/', homePage);
app.get('/favorite-quotes', favoriteQuotesGet)
app.post('/favorite-quotes', favoriteQuotesPost);
app.get('/favorite-quotes/:quote_id', detailsHandler);
app.delete('/favorite-quotes/:quote_id', deleteHandler);
app.put('/favorite-quotes/:quote_id', updateHandler)
const allSipmsons = [];

function Sipmsons(quote, character, image, characterDirection) {
    this.quote = quote;
    this.character = character;
    this.image = image;
    this.characterDirection = characterDirection;
    allSipmsons.push(this)
}

function homePage(request, response) {
    let url = `https://thesimpsonsquoteapi.glitch.me/quotes?count=10`;
    superagent.get(url).set('User-Agent', '1.0').then(responseAPI => {
        responseAPI.body.forEach(element => {
                let newSimpsons = new Sipmsons(element.quote, element.character, element.image, element.characterDirection)
            })
            // response.send(allSipmsons);
        response.render('index', { allSipmsons: allSipmsons });
    })
}

function favoriteQuotesGet(request, reponse) {
    let SQL = `SELECT * FROM tableOne;`;
    client.query(SQL).then(allSave => {
        reponse.render('favorite', { saves: allSave.rows })
    })
}

function favoriteQuotesPost(request, response) {
    let quote = request.body.saveSimpson[0];
    let character = request.body.saveSimpson[1];
    let image = request.body.saveSimpson[2];
    let characterDirection = request.body.saveSimpson[3];
    let SQL = `INSERT INTO tableOne (quote
        ,character
        ,image
        ,characterDirection)
    VALUES ($1, $2, $3,$4);`;
    let values = [quote, character, image, characterDirection]
    client.query(SQL, values).then(() => console.log('insert done'))
    response.redirect('/favorite-quotes')
}

function detailsHandler(request, response) {
    let id = request.params.quote_id;
    let SQL = `SELECT * FROM tableOne WHERE id=$1;`;
    let values = [id];
    client.query(SQL, values).then(element => {
        // response.send(element.rows[0])
        // console.log('for details page: ', element.rows[0]);
        response.render('details', { detailsData: element.rows[0] })
    })
}

function deleteHandler(request, response) {
    let id = request.params.quote_id;
    let SQL = `DELETE FROM tableOne WHERE id=$1`;
    let values = [id];
    client.query(SQL, values).then(element => console.log('delete done'))
    response.redirect('/favorite-quotes')
}

function updateHandler(req, res) {
    let id = req.body.updataForm[0];
    let updatedQuote = req.body.updataForm[1]
    let SQL = `UPDATE tableOne
    SET quote = $2 
    WHERE id=$1;`;
    let values = [id, updatedQuote]
    client.query(SQL, values).then(element => {
        console.log('updata done');
    })
    res.redirect(`/favorite-quotes/${id}`)
}
client.connect().then(() => {
    app.listen(PORT, () => console.log('you are working on port number ', PORT))
})