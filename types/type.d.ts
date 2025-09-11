declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

export type User = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  council: string;
  mobile?: string | null;
};
