

exports.getRestaurant = async (event, context) => {
    let lambda_response;
    
    try {
        lambda_response = {     
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
                  "genericAttachments": [
                      {
                         "title":"restaurant name",
                         "buttons":[ 
                             {
                                "text":"this is the text",
                                "value":"Talay Thai Restaurant"
                             }
                          ]
                       },
                        {
                         "title":"restaurant name2",
                         "buttons":[ 
                             {
                                "text":"this is the text2",
                                "value":"Thai Basil Restaurant"
                             }
                          ]
                       }, 
                   ] 
                } 
            }
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return lambda_response;
};

