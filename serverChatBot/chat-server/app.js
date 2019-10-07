const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.getRestaurant = async (event, context) => {
    
    const failedResponse = {     
        "sessionAttributes": {
            "food":  event.currentIntent.slots.Food
        },   
        "dialogAction": {
            "type": "Close",    
            "fulfillmentState": "Failed",    
            "message": {      
                "contentType": "PlainText",      
                "content": "Sorry I do not have this type of food in my Database yet. Wanna try something else?"    
            },
        }
    };
    
    
    try {
        let queryResult = await getRestaurantByType(event.currentIntent.slots.Food.toLowerCase());
        
        if (queryResult.Count === 0){
            throw new Error("Not exist in Database");   
        }
        
        let cards = await constructCards(queryResult);
        let SuccessResponse = {     
            "sessionAttributes": {
                "food":  event.currentIntent.slots.Food
            },   
            "dialogAction": {
                "type": "ElicitIntent",
                "message": {
                  "contentType": "PlainText",
                  "content": `I have found the following restaurants for ${event.currentIntent.slots.Food} :`
                },
                "responseCard": {
                  "version": 1,
                  "contentType": "application/vnd.amazonaws.card.generic",
                  "genericAttachments": cards
                } 
            }
        }
        return SuccessResponse;
    } catch (err) {
        return failedResponse;
    }


};

async function getRestaurantByType(type){
    var params = {
        TableName: 'restaurant_test',
        ProjectionExpression: "restaurant_name",
        FilterExpression: `#restType = :t`,
        ExpressionAttributeNames: {
            "#restType": "type",
        },
        ExpressionAttributeValues: {
            ":t": type,
        }
    };
    return docClient.scan(params).promise();
}

async function constructCards(event){
    let sol = [];
    for( let item of event.Items ) {
        sol.push({
            title: item.restaurant_name,
            buttons:[ 
                {
                    text :"This one!",
                    value: item.restaurant_name
                }
            ]
        })            
    }
    return sol
}


