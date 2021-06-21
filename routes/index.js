const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Auction = require('../models/auction');
// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
// Home
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

//Biding
router.get('/biding', ensureAuthenticated, (req, res) =>
  res.render('biding', {
    user: req.user
  })
);


router.post('/biding', (req, res) => {
  const {rate, energy, name} = req.body
  let errors = [];

  if (!rate || !energy) {
    errors.push({ msg: 'Please enter all fields' });
  }
  else{
    User.findOne({name:name}).then((user) => {
      if(parseInt(user.energy) <= parseInt(energy)){
        errors.push({ msg: 'Energy Insufficient (or) cannot expense full energy in transaction' });
        res.render('biding', {
          errors,
          user:name,
          rate,
          energy
        });
      }
      else{
          const newAuction = new Auction({
            name:name,
            rate:rate,
            energy:energy
          });
          newAuction
              .save()
              .then(auction => {
                req.flash(
                  'success_msg',
                  'Your tariff has been posted in auction page'
                );
                res.redirect('/dashboard');
              })
              .catch(err => console.log(err))
      }
    })
  }
})

//Auction

router.get('/auction', ensureAuthenticated, (req, res) => {

  Auction.find({}, (err, auctions) => {
    res.render('auction', {auctions:auctions, user:req.user});  
  });

});

router.post('/auction', (req, res) => {
    const {sender, rate, energy, reciever} = req.body
    var netAmount = parseInt(energy)*parseInt(rate)
    let errors = [];
    var amounts = [];
    var energys = [];

    User.findOne({name:reciever}).then(user => {
      if (parseInt(user.amount) < parseInt(rate)*parseInt(energy)) {
        errors.push({ msg: 'Insufficient Balance' });
        res.render('auction', {
          errors
        });
      }
      else{
        User.findOne({name:sender})
          .then(user => {
            amounts.push(parseInt(user.amount))
            energys.push(parseInt(user.energy))  
          })
          .catch(err => {
            console.log(err)
          })
        User.findOne({name:reciever})
          .then(user => {
            amounts.push(parseInt(user.amount))
            energys.push(parseInt(user.energy))  
          })
          .catch(err => {
            console.log(err)
          })
        setTimeout(() => { 
            var newAmountS = amounts[0] + netAmount
            var newEnergyS = energys[0] - parseInt(energy)
            var newvalues = { $set: {amount: newAmountS.toString(), energy: newEnergyS.toString()} };
            User.updateOne({ name:sender }, newvalues, (err, res) => {
              if (err) throw err;
              console.log("Sender Account updated");
            }); 
        }, 5000);
        setTimeout(() => {
            var newAmountR = amounts[1] - netAmount
            var newEnergyR = energys[1] + parseInt(energy)
            var newvalues = { $set: {amount: newAmountR.toString(), energy: newEnergyR.toString()} };
            User.updateOne({ name:reciever }, newvalues, (err, res) => {
              if (err) throw err;
              console.log("Reciever Account updated");
            });
        }, 5000);
        setTimeout(() => {
          Auction.deleteOne({ name:sender, rate:rate }, (err, obj)=> {
            if (err) throw err;
            console.log("Successfully deleted");
          });  
        }, 6000)
        setTimeout(() => {
          res.redirect('/dashboard')
        }, 7000)
      }
    })

})

module.exports = router;
