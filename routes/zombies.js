const express = require('express');
const router = express.Router();
const db = require('../db');

/* GET lista de zumbis. */
router.get('/', (req, res, next) => {

  db.query('SELECT * FROM zombie', function(err, rows) {
    // negociação de conteúdo
    res.format({
      html: function() {
        res.render('listZombies', { zombies: rows });
      },
      json: function() {
        res.json({ zombies: rows });
      }
    });
  });
});

/* GET detalhes de um zumbi. */
router.get('/:id', (req, res) => {
    db.query({
      sql: 'SELECT * ' +
           'FROM zombie ' +
           'LEFT OUTER JOIN zombie biter ' +
             'ON zombie.bittenBy = biter.id ' +
           'WHERE zombie.id = ' + db.escape(req.params.id),
      nestTables: true
    }, (err, rows) => {
        if (err) {
          res.status(500).send('Erro desconhecido: ' + err);
        }

        // negociação de conteúdo: responde em HTML (ie, renderiza a view) se
        // a requisição tem o cabeçalho "Accepts: text/html", ou em JSON se
        // "Accepts: application/json"
        res.format({
          html: function() {
            if (rows.length > 0) {
              rows[0].zombie.born = require('../dbUtils').getReadableDateString(rows[0].zombie.born);
              res.render('detailsZombie', { zombie: rows[0] });
            } else {
              res.status(404).send('Zumbi nao encontrado. Tente novamente de noite.');
            }
          },
          json: function() {
            if (rows.length > 0) {
              res.json({ zombie: rows[0] });
            } else {
              res.status(404).send({});
            }
          }
        });
    });
});


/* POST cria um novo zumbi a partir de uma pessoa */
router.post('/brains', (req, res) => {
  // busca nome da pessoa mordiscada
  // criar um novo zumbi com nome similar ao da pessoa
  // e excluir a pessoa

  db.query('SELECT name FROM person WHERE id = ' + db.escape(req.body.person),
    (err, result) => {
      if (err) {
        res.status(500).send('Erro ao mordiscar. Talvez estivesse estragado.');
        return;
      }
      if (typeof result[0] === 'undefined') {
        req.flash('error', 'Pessoa nao encontrada!');
        res.redirect('/');
        return;
      }

      const previousName = result[0].name;
      const firstName = previousName.split(' ')[0];
      const newName = ['a','e','i','o','u','w','y'].indexOf(firstName.substring(0,1).toLowerCase()) === 0 ? ('Z' + firstName.toLowerCase()) : ('Z' + firstName.substring(1).toLowerCase());
      const born = require('../dbUtils').getMySQLDate(new Date());
      const picIndex = Math.floor((Math.random() * (20-7))) + 7;
      const biterId = req.body.zombie;
      db.query("INSERT INTO `zombies`.`zombie` (`id`, `name`, `born`, `previousName`, `pictureUrl`, `bittenBy`) VALUES (NULL, '" + newName + "', '" + born + "', '" + previousName + "', 'zombie" + picIndex + ".jpg', " + biterId + ");",
        (err, result) => {
          if (err) {
            res.status(500).send('Erro ao mordiscar. Talvez estivesse estragado.');
            return;
          }

          db.query('DELETE FROM zombies.person WHERE id = ' + req.body.person,
            (err, result) => {
              if (err) {
                res.status(500).send('Erro ao mordiscar. Talvez estivesse estragado.');
                return;
              }

              req.flash('peopleCountChange', '-1');
              req.flash('zombieCountChange', '+1');
              req.flash('success', 'Um novo zumbi se mudou para o jardim: ' + newName);
              res.redirect('/');
            });
        });

    });
});


module.exports = router;
