import { IUser } from '@/models/User';

export type ProfileType = 'donor' | 'donateLater' | 'healthIssue' | 'underAge' | 'aboveAge' | 'default';

export const getProfileType = (user: IUser): ProfileType => {
  if (user.role === 'donor') {
    return 'donor';
  }

  switch (user.signupReason) {
    case 'donateLater':
      return 'donateLater';
    case 'healthIssue':
      return 'healthIssue';
    case 'underAge':
      return 'underAge';
    case 'aboveAge':
      return 'aboveAge';
    case 'ageRestriction': {
      // Handle legacy ageRestriction by calculating age
      const currentAge = user.currentAge || 0;
      return currentAge < 18 ? 'underAge' : 'aboveAge';
    }
    default:
      return 'default';
  }
};

export const getProfileTitle = (profileType: ProfileType): string => {
  switch (profileType) {
    case 'donor':
      return 'Donor Profile';
    case 'donateLater':
      return 'Donate Later Profile';
    case 'healthIssue':
      return 'Health Issue Profile';
    case 'underAge':
      return 'Under Age Profile';
    case 'aboveAge':
      return 'Above Age Profile';
    default:
      return 'User Profile';
  }
};

export const getProfileDescription = (profileType: ProfileType): string => {
  switch (profileType) {
    case 'donor':
      return 'You are a registered blood donor. Thank you for your contribution!';
    case 'donateLater':
      return 'You can become a donor anytime! Update your profile with blood donation details when you\'re ready.';
    case 'healthIssue':
      return 'We understand that health conditions may prevent blood donation. You can still support our mission by spreading awareness.';
    case 'underAge':
      return 'You need to be 18 or older to donate blood. We\'ll notify you when you become eligible!';
    case 'aboveAge':
      return 'We understand that age-related factors may prevent blood donation. You can still support our mission by encouraging others to donate.';
    default:
      return 'Manage your profile information and preferences.';
  }
}; 