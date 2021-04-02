import { MouseEventHandler, useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { Member } from '../interfaces';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
        if (confirm('Are you sure you want to delete your profile?')) {
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
        <FontAwesomeIcon className='remove-icon' icon={faTimes} />
      </button>
    </button>
  ) : (
    <button>+</button>
  );
};

export default MemberItem;
