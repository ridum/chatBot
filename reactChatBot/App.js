/**
 * Sample React Native chat UI Based from :
 * https://aws-amplify.github.io/docs/js/interactions#WorkingWithAPI
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, Alert, StatusBar } from 'react-native';
import Amplify from 'aws-amplify';
import { ChatBot } from 'aws-amplify-react-native';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: StatusBar.currentHeight,
  },
});

export default class App extends Component {

    state = {
        botName: 'ScheduleAppointment_test',
        welcomeMessage: 'Hello, it is lunch time, what do you want to eat today?',
    };

    constructor(props) {
        super(props);
        this.handleComplete = this.handleComplete.bind(this);
    }

    handleComplete(err, confirmation) {
        if (err) {
        Alert.alert('Error', 'Bot conversation failed', [{ text: 'OK' }]);
        return;
        }

        Alert.alert('Done', JSON.stringify(confirmation, null, 2), [{ text: 'OK' }]);

        this.setState({
        botName: 'BookTrip',
        });

        return 'Trip booked. Thank you! what would you like to do next?';
    }

    render() {
        const { botName, welcomeMessage } = this.state;

        return (
        <SafeAreaView style={styles.container}>
            <ChatBot
            botName={botName}
            welcomeMessage={welcomeMessage}
            onComplete={this.handleComplete}
            clearOnComplete={false}
            styles={StyleSheet.create({
                itemMe: {
                color: 'red'
                }
            })}
            />
        </SafeAreaView>
        );
    }

}
