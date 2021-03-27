import { Member } from '../interfaces';
import { useCallback } from 'react';

interface MemberItemProps {
  profile: Member;
  onClickProfile: (profile: Member) => void;
  onClickDelete: (id: number) => void;
}

const MemberItem = ({
  profile,
  onClickProfile,
  onClickDelete,
}: MemberItemProps) => {
  const handleClickProfile = useCallback(() => {
    try {
      onClickProfile(profile);
    } catch (error) {
      throw error;
    }
  }, [onClickProfile]);

  const handleClickDelete = useCallback(() => {
    try {
      if (window.confirm('Are you sure you want to delete your profile?')) {
        onClickDelete(profile.id);
      }
    } catch (error) {
      throw error;
    }
  }, [onClickDelete]);

  return (
    <div>
      <span onClick={handleClickProfile}>{profile.nickname}</span>
      <button onClick={handleClickDelete}>x</button>
    </div>
  );
};

export default MemberItem;
