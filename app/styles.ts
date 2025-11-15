import { StyleSheet } from 'react-native';

export const colors = {
  punchRed: '#e63946',
  white: '#ffffff',
  frostedBlue: '#a8dadc',
  cerulean: '#457b9d',
  oxfordNavy: '#1d3557',
  divider: '#e0e0e0',
  gray: '#9E9E9E'
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
    backgroundColor: colors.oxfordNavy
  },
  card,
  buttonCard: {
    ...card,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.frostedBlue
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
    color: colors.punchRed,
    fontFamily: 'Atkinson'
  },
  buttonTextDark: {
    fontSize: 48,
    color: colors.punchRed,
    fontFamily: 'Atkinson'
  },
  centerText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.oxfordNavy,
    fontFamily: 'Atkinson'
  },
  pageText: {
    fontSize: 48,
    color: colors.punchRed,
    fontFamily: 'Atkinson'
  },
  text: {
    fontSize: 16,
    color: colors.oxfordNavy,
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
