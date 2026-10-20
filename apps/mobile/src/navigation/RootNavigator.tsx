import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/screens/home/HomeScreen';
import type { RootStackParamList } from './types';

// A native stack uses the platform's own navigation (UINavigationController on iOS, Fragments on
// Android) through react-native-screens, so transitions and the back gesture are truly native.
const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <RootStack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      {/* Screens from the design brief (S-xx) are registered here, one <Screen> each. */}
      <RootStack.Screen name="Home" component={HomeScreen} />
    </RootStack.Navigator>
  );
}

// Makes useNavigation(), navigation.navigate() etc. type-checked against RootStackParamList.
type RootStackType = typeof RootStack;
declare module '@react-navigation/native' {
  // Empty on purpose: it only merges in RootStackType.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
  interface RootNavigator extends RootStackType {}
}
