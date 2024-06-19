// Example usage in a page component
import ProfileForm from './components/ProfileForm';
import SettingsForm from './components/SettingForm';

// Assuming these props are fetched and passed to the page component
const UserProfilePage: React.FC<{ user: any; settings: any; }> = ({ user, settings }) => {
  return (
    <div>
      <h1>User Profile</h1>
      <ProfileForm user={user} />
      <SettingsForm settings={settings} />
    </div>
  );
};

export default UserProfilePage;
