import * as crypto from 'crypto';

export const randomString = (length: number): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const isNotNullOrEmpty = (value: any) => {
  return value !== null && value !== '' && value !== undefined;
};

export const generateRandomUsernameFromEmail = (email: string) => {
  const [username] = email.split('@');
  const randomString = crypto.randomBytes(4).toString('hex');
  const randomUsername = `${username}_${randomString}`;

  return randomUsername;
};

export const transformPhoneNumber = (phoneNumber: string) => {
  const cleanedPhoneNumber = phoneNumber.replace(/^08/, '8');

  return cleanedPhoneNumber.startsWith('+62')
    ? cleanedPhoneNumber
    : `+62${cleanedPhoneNumber}`;
};

interface NestedObjectContains {
  [key: string]: NestedObjectContains | { contains: string };
}

export const convertStringToObjectContains = (
  inputString: string,
  valueToContain: string,
): NestedObjectContains => {
  const parts = inputString.split('.');
  const result: NestedObjectContains = {};

  let currentLevel: NestedObjectContains = result;

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    currentLevel[key] =
      i === parts.length - 1 ? { contains: valueToContain } : {};
    currentLevel = currentLevel[key] as NestedObjectContains;
  }

  return result;
};
