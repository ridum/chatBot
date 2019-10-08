/**
 * Sample React Native chat UI Based from :
 * https://medium.com/@itsHabib/integrate-an-amazon-lex-chatbot-into-a-react-native-app-1536883ccbed
 *
 
 */

import React, { Component } from 'react';
import {
    Text, 
    View, 
    Button,
    StyleSheet,
    TextInput,
    FlatList,
} from 'react-native'
import awsconfig from './aws-exports';
import AWS from 'aws-sdk';
AWS.config.region = awsconfig.aws_bots_config[0].region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsconfig.aws_cognito_identity_pool_id,
})

let lexRunTime = new AWS.LexRuntime();
let lexUserId = 'mediumBot' + Date.now();
let START_MSG = 'Hello, it is lunch time, what do you want to eat today?';
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messages: {
        flex: 1,
        marginTop: 20,},
    botMessages: {
        color: 'black',
        backgroundColor: 'white',
        padding: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 20,
        borderTopLeftRadius: 20,
        marginBottom: 0,
        borderTopRightRadius: 20,
        alignSelf: 'flex-start',
        bottom: 23,
        width: '75%'
    },
    buttonContainer: {
        color: 'black',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 20,
        borderTopLeftRadius: 20,
        marginBottom: 0,
        borderTopRightRadius: 20,
        alignSelf: 'flex-end',
        bottom: 23,

    },
    userMessages: {
        backgroundColor: '#40AD4D',
        color: 'white',
        padding: 10,
        marginBottom: 10,
        marginRight: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '65%',
        alignSelf: 'flex-end',
        textAlign: 'left'
    },
    textInput: {
        flex: 2,
        paddingLeft: 15
    },
    responseContainer : {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#EEEFFA',
    },
})

export default class App extends Component {
    constructor(props) {
        super(props)    
        this.state = {
            userInput: '',
            messages: [{from: 'bot', msg: START_MSG}],
            inputEnabled: true,
        }
    }
    
    // Sends Text to the lex runtime
    handleTextSubmit() {
        let inputText = this.state.userInput.trim()
        if (inputText !== '')
            this.showRequest(inputText)
    }
    
    // Populates screen with user inputted message
    showRequest(inputText) {
        // Add text input to messages in state
        let oldMessages = Object.assign([], this.state.messages)
        oldMessages.unshift({from: 'user', msg: inputText})
        this.setState({
            messages: oldMessages,
            userInput: '',
            inputEnabled: false
        })
        this.sendToLex(inputText)     
    }
    
    // Responsible for sending message to lex
    sendToLex(message) {
        let params = {
            botAlias: '$LATEST',
            botName: awsconfig.aws_bots_config[0].name,
            inputText: message,
            userId: lexUserId,
        }        
        lexRunTime.postText(params, (err, data) => {
            if(err) {
                // TODO SHOW ERROR ON MESSAGES
            }
            if (data) {
                this.showResponse(data)
            }
        })
    }
    showResponse(lexResponse) {
        let lexMessage = lexResponse.message;
        let oldMessages = Object.assign([], this.state.messages)
        oldMessages.unshift({from: 'bot', msg: lexMessage})
        
        if(lexResponse.responseCard && lexResponse.responseCard.genericAttachments){
            for (let card of lexResponse.responseCard.genericAttachments){
                oldMessages.unshift({from: 'bot_selection', msg: JSON.stringify(card.title)});                
            }
        }
        
        this.setState({
            messages: oldMessages,
            inputEnabled: true 
        })
    }
    renderTextItem(item) {
        let style,responseStyle
        if (item.from === 'bot') {
            style = styles.botMessages
            responseStyle = styles.responseContainer
        } else if (item.from === 'bot_selection'){
            style = styles.botMessages
            responseStyle = styles.responseContainer
            return (
                <View style={responseStyle}>
                    <Text style={style}>{item.msg}</Text>
                    <View style={styles.buttonContainer}>
                        <Button         
                            title = 'This One!'
                            onPress={() => this.sendToLex(item.msg)}
                        />
                    </View>
                </View>
            )
        } else {
            style = styles.userMessages
            responseStyle = {}
        }

        return (
            <View style={responseStyle}>
                <Text style={style}>{item.msg}</Text>
            </View>
        )
    }
    render(){
        return(
            <View style={styles.container}>
                <View style={styles.messages}>
                    <FlatList 
                        data={this.state.messages}
                        renderItem={({ item }) =>    this.renderTextItem(item)}
                        keyExtractor={(item, index) => String(index)}
                        inverted = {true}
                        extraData={this.state.messages}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        onChangeText={(text) => this.setState({userInput: text})}
                        value={this.state.userInput}
                        style={styles.textInput}
                        editable={this.state.inputEnabled}
                        placeholder={'Click here for input!'}
                        autoFocus={true}
                        onSubmitEditing={this.handleTextSubmit.bind(this)}
                    />
                </View>
            </View>)
    }
}