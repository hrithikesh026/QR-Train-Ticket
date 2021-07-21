var request = require('request');
var { parse } = require('node-html-parser');


const classs = new RegExp(/&quot;c&quot;:&quot;..?&quot;/ug)
const price = new RegExp(/<td>&#8377; .*?<\/td>/ug)

//scrapping required data from https://etrain.info/

const getTrainList =async (from, to,callback)=>{
    const regex = new RegExp('{"typ".*}')
    
    const url = "https://etrain.info/trains/"+from+"-to-"+to;
    var trainlist = []
    await request.get(url,(error,data)=>{
        if(error){
            callback(err)
            console.log("Something went wrong");
        }
        else{
            console.log(data.statusCode)
            str = data.body;
        
            const root = parse(str);
            
            var date = Date.now()
            var d = new Date(date)
            var today = d.getDay()
            var hours = d.getHours()
            var minutes = d.getMinutes()
            root.querySelectorAll('tr').forEach((element)=>{
                if(element.rawAttrs.includes('data-train=')){
                    var train_detail = JSON.parse(element.rawAttrs.match(regex)[0])
                    
                    var validtrain = 0
                    if(train_detail.dy.charAt(d.getDay()) === '1' && train_detail.s === from){
                        // console.log(train_detail)
                        l = train_detail.dt.split(":");
                        var thours = parseInt(l[0])
                        var tminutes = parseInt(l[1])
                        if(thours>=hours){
                            if(thours==hours){
                                if(tminutes>minutes+2){
                                    validtrain=1;
                                    // trainlist.push(train_detail)
                                }
                            }
                            else{
                                validtrain=1
                                // trainlist.push(train_detail)
                            }
                        }
                        
                    }
                    ticket_price = {}
                    if(validtrain ===1 ){
                        console.log('=================================================')
                        element.childNodes.forEach((child)=>{
                            if(child.rawAttrs.includes('class="wd19"')){
                               
                                ticket_price[child.toString().match(classs)[0].slice(20,22)] = child.toString().match(price)[0].match(/\d+/g)[1]
                                
                            }
                        })
                        train_detail['ticket_price'] = ticket_price
                        trainlist.push(train_detail)

                        
                    }
                    
                }
            })
            callback(undefined,trainlist)
        }
    })
    

}
getTrainList('MAQ','KGQ',(err,doc)=>{
    if(err){
        console.log(err)
    }
    else{
        console.log(doc)
    }
})

module.exports = {getTrainList}




