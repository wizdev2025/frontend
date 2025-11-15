import { StyleSheet } from 'react-native';

const card = {
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  card,
  buttonCard: {
    ...card,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonGreen: {
    backgroundColor: '#4CAF50'
  },
  buttonYellow: {
    backgroundColor: '#FFEB3B'
  },
  buttonRed: {
    backgroundColor: '#F44336'
  },
  buttonGray: {
    backgroundColor: '#9E9E9E'
  },
  buttonPurple: {
    backgroundColor: '#9C27B0'
  },
  inputCard: {
    ...card,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  displayCard: {
    ...card,
    backgroundColor: '#f9f9f9'
  },
  buttonText: {
    fontSize: 48,
    color: '#fff'
  },
  buttonTextDark: {
    fontSize: 48,
    color: '#000'
  },
  centerText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  pageText: {
    fontSize: 48
  }
});
