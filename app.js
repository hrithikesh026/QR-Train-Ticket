    const express = require('express')
    const mongo  = require('./db_connection/mongo')
    const bodyParser = require('body-parser')
    const trainlist = require('./utils/trainlist')
// const { response } = require('express')
    const port = process.env.PORT || 3000
    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    app.post('/register',(req,res)=>{
        var response_text = ''
        if(getAge(req.body.dob)>=15){
            mongo.fetch_user(req.body.email,(err,body)=>{
                if(err){
                    response_text='Something went wrong. Please try again later'
                    res.status(502).send(response_text)
                }
                else{
                    if(body==null){
                        mongo.add_user(req.body,(err,result)=>{
                            if(err){
                                response_text='Something went wrong. Please try again later'
                                res.status(502).send(response_text)
                            }
                            else{
                                response_text='Register_Success'
                                res.status(202).send(response_text)
                            }
                        })
                    }
                    else{
                        response_text = 'Email already exists. Please enter a Different Email'
                        res.status(502).send(response_text)
                    }
                }
            })
            
        }
        else{
            console.log('NOT eligible')
            res.send('Not Eligible')
        }
        // res.send(response_text)
        
        //Check if user already exists
        
    })

    app.post('/login',(req,res)=>{
        var response_text = ''
        mongo.fetch_user(req.body.email,(err,data)=>{ //user authentication
            if(err){
                console.log('Error while fetching user :'+err)
                response_text = 'Something went wrong. Please try again later'
                res.status(502).send(response_text)
            }
            else{
                if(data==null){ //Email does't exist
                    response_text = 'Email Does\'t Exist. Please register first'
                    res.status(400).send(response_text)
                }
                else{ //Email exists and checking is password matches
                    if(req.body.password == data.password){
                        response_text = 'Loggin_Success'
                        res.status(202).send(response_text)
                    }
                    else{
                        response_text = 'Password Mismatched'
                        res.status(400).send(response_text)
                    }
                }
            }
        })
        // res.send(response_text)
    })

    app.post('/gettrainlist',function await({body},res){
        const source = body.source
        const destination = body.destination
        //return list of trains between given two stations
        // console.log(trainlist.getTainList(source,destination))
        trainlist.getTainList(source,destination,(err,result)=>{
            if(err){
                console.log('Error while fetching train list'+err)
                res.status(500).send('Error while fetching train details'+err)
            }
            else{
                res.status(202).send(result)
            }
            
        })
        
        
    })

    app.post('/buyticket',({body},res)=>{
        
        mongo.add_tickets(body,(err,pass)=>{
            if(err){
                res.status(500).send("Server Error")
            }
            else{
                res.status(202).send('Transaction Successfull')
            }
        })
    })

    app.post('/getticket',({query},res)=>{
        mongo.fetch_tickets(query.email,(err,tickets)=>{
            if(error){
                res.status(502).send('Error while fetching Tickets')
            }
            else{
                res.status(202).send(tickets)
            }
        })
    })
    
    app.post('/recharge',({body},res)=>{
        mongo.recharge(body,(err,data)=>{
            if(err){
                console.log(err)
                res.status(500).send('Recharge unsuccessfull')
            }
            else{
                console.log('recharge success')
                res.status(202).send('Recharge successfull')
            }
        })
    })


    // app.post('/authenticate',(req,res)=>{

    // })

    // app.post()

    app.listen(port,()=>{
        console.log('server up and running on port '+ port)
        
    })

