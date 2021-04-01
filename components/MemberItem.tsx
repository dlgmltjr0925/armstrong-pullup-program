import { MouseEventHandler, useCallback } from 'react';

import Image from 'next/image';
import { Member } from '../interfaces';

interface MemberItemProps {
  profile?: Member;
  onClickProfile?: (profile: Member) => void;
  onClickDelete?: (id: number) => void;
}

const MemberItem = ({
  profile = { id: 0, nickname: '' },
  onClickProfile,
  onClickDelete,
}: MemberItemProps) => {
  const handleClickProfile: MouseEventHandler = useCallback(() => {
    try {
      if (onClickProfile) onClickProfile(profile);
    } catch (error) {
      throw error;
    }
  }, [onClickProfile]);

  const handleClickDelete: MouseEventHandler = useCallback(
    (e) => {
      e.stopPropagation();
      try {
        if (window.confirm('Are you sure you want to delete your profile?')) {
          if (onClickDelete) onClickDelete(profile.id);
        }
      } catch (error) {
        throw error;
      }
    },
    [onClickDelete]
  );

  return profile ? (
    <button className='member-item' onClick={handleClickProfile}>
      <span className='nickname'>{profile.nickname}</span>
      <button className='remove-icon-wrapper' onClick={handleClickDelete}>
        <Image
          className='remove-icon'
          src='/assets/images/iconClose.png'
          alt='remove'
          width={12}
          height={12}
        />
      </button>
    </button>
  ) : (
    <button>+</button>
  );
};

export default MemberItem;
