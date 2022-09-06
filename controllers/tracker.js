const User = require('../models/User')
const Target = require('../models/Target')
const mongoose = require('mongoose')
const Calorie = mongoose.models['Calorie']

module.exports = {
    getTarget: async (req,res)=>{
        try{
            let newCalorie = new Calorie({
                userId:req.user._id
            })
            // by Cy: finds  and   filters for the users current day calorie item
            let dailyCalorie = await Calorie.findOne({
                userId:req.user._id,
                'date.day':new Date().getDate(),
                'date.month':new Date().getMonth(),
                'date.year':new Date().getFullYear()
            },null,
            {
                upsert:true,
                setDefaultsOnInsert:true,
                new:true,
            },(err,item)=>{
                if(err) res.sendStatus(500)
            })

            //by Cy: creates the calorie item if not present
            if(!dailyCalorie){
                dailyCalorie = await newCalorie.save({
                    userId:req.user._id
                })
            }
            //by Cy: I think the Calorie model may be the better use case for tracking currently
            const targetCalories = await User.find({userId:req.user.id})
            res.render('tracker.ejs', {target: targetCalories, user: req.user, dailyCalorie:dailyCalorie})
        }catch(err){
            console.log(err)
        }
    },

    updateTarget: async (req, res)=>{
        try{
            await User.findByIdAndUpdate(
                {_id:req.user.id},
                {targetCalories: req.body.newTargetCal}
                )
            console.log('Updated calorie target')
            res.redirect('/tracker')
        }catch(err){
            console.log(err)
        }
    },
    // method needs finished: by Cy, this will add the food item and calorie count recieved in the request to the database.
    addFoodItem: async (req, res)=>{
        console.log(req.body)

        let dailyCalorie = await Calorie.find({userId:req.user._id})
        if(dailyCalorie.length){
            let date = Date.now()
            let today = date.getDate()
            let month = date.getMonth()
            let year = date.getFullYear()
            dailyCalorie.filter((dailyEntry)=>{
                dailyEntry.date.getDate() === today &&
                dailyEntry.date.getMonth() === month &&
                dailyEntry.date.getFullYear() === year
            })
        }
        console.log(dailyCalorie)
        res.sendStatus(200)
    }
}