import { StyleSheet } from 'react-native';

export const colors = {
  textMain: '#0e1daa',
  textMainVisual: '#050b3d',
  white: '#ffffff',
  buttonBackground: '#f0e6e7',
  cerulean: '#457b9d',
  background: '#1d3557',
  divider: '#e0e0e0',
  gray: '#9E9E9E',
  red: '#F00000'
};

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
    backgroundColor: colors.background
  },
  card,
  buttonCard: {
    ...card,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.buttonBackground
  },
  buttonGray: {
    backgroundColor: colors.gray
  },
  inputCard: {
    ...card,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cerulean
  },
  displayCard: {
    ...card,
    backgroundColor: colors.white
  },
  buttonText: {
    fontSize: 48,
    color: colors.textMainVisual,
    fontFamily: 'Atkinson-Bold'
  },
  buttonTextVisual: {
    fontSize: 70,
    color: colors.textMainVisual,
    fontFamily: 'Atkinson-Bold'
  },
  centerText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    fontFamily: 'Atkinson'
  },
  pageText: {
    fontSize: 48,
    color: colors.textMain,
    fontFamily: 'Atkinson'
  },
  text: {
    fontSize: 16,
    color: colors.background,
    fontFamily: 'Atkinson'
  },
  textSecondary: {
    fontSize: 14,
    color: colors.cerulean,
    fontFamily: 'Atkinson'
  },
  placeholder: {
    color: colors.cerulean,
    fontFamily: 'Atkinson'
  }
});
