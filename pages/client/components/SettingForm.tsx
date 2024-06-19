import React, { useState, FormEvent } from 'react';

type SettingsFormProps = {
  settings: {
    userId: string;
    notifications: boolean;
    privacy: string;
    chatPreferences: string;
  };
};

const SettingsForm: React.FC<SettingsFormProps> = ({ settings }) => {
  const [notifications, setNotifications] = useState<boolean>(settings.notifications);
  const [privacy, setPrivacy] = useState<string>(settings.privacy);
  const [chatPreferences, setChatPreferences] = useState<string>(settings.chatPreferences);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/user/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: settings.userId,
        notifications,
        privacy,
        chatPreferences
      })
    });

    if (!response.ok) {
      // Handle error here
      console.error('Failed to update settings');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          /> Notifications
        </label>
      </div>
      <div>
        <label htmlFor="privacy">Privacy Level:</label>
        <select id="privacy" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
          <option value="public">Public</option>
          <option value="friends">Friends</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div>
        <label htmlFor="chatPreferences">Chat Preferences:</label>
        <select id="chatPreferences" value={chatPreferences} onChange={(e) => setChatPreferences(e.target.value)}>
          <option value="random">Random</option>
          <option value="same_interests">Same Interests</option>
        </select>
      </div>
      <button type="submit">Update Settings</button>
    </form>
  );
};

export default SettingsForm;
