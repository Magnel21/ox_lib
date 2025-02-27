import { useNuiEvent } from '../../hooks/useNuiEvent';
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Box, Center, createStyles, Group, keyframes, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import React, { useState } from 'react';
import tinycolor from 'tinycolor2';
import type { NotificationProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';
import { describe } from 'node:test';

const useStyles = createStyles((theme) => ({
  container: {
    width: 300,
    height: 65,
    background: theme.colors.basicBg[1],
    color: theme.colors.dark[0],
    fontFamily: 'Helvetica',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'left',
    // border: '1px solid #19212E', // Poprawiona składnia
  },

  iconWrapper: {
    marginTop: 0,
    marginLeft: 0,
    height: 65,
    width: 65,
    background: theme.colors.darkerBg[0],
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    fontSize: 28,
  },

  title: {
    fontWeight: 600,
    lineHeight: 'normal',
    fontFamily: 'Helvetica',
  },

  description: {
    fontWeight: 400,
    lineHeight: 'normal',
    fontFamily: 'Helvetica',
    paddingTop: 3,
    fontSize: 12,
    opacity: 0.6,
  },

  textWrapper: {
    marginLeft: 10,
    marginTop: 'auto',
    marginBottom: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  
}));

const createAnimation = (from: string, to: string, visible: boolean) => keyframes({
  from: {
    opacity: visible ? 0 : 1,
    transform: `translate${from}`,
  },
  to: {
    opacity: visible ? 1 : 0,
    transform: `translate${to}`,
  },
});

const getAnimation = (visible: boolean, position: string) => {
  const animationOptions = visible ? '0.2s ease-out forwards' : '0.4s ease-in forwards'
  let animation: { from: string; to: string };

  if (visible) {
    animation = position.includes('bottom') ? { from: 'Y(30px)', to: 'Y(0px)' } : { from: 'Y(-30px)', to:'Y(0px)' };
  } else {
    if (position.includes('right')) {
      animation = { from: 'X(0px)', to: 'X(100%)' }
    } else if (position.includes('left')) {
      animation = { from: 'X(0px)', to: 'X(-100%)' };
    } else if (position === 'top-center') {
      animation = { from: 'Y(0px)', to: 'Y(-100%)' };
    } else if (position === 'bottom') {
      animation = { from: 'Y(0px)', to: 'Y(100%)' };
    } else {
      animation = { from: 'X(0px)', to: 'X(100%)' };
    }
  }

  return `${createAnimation(animation.from, animation.to, visible)} ${animationOptions}`
};

const durationCircle = keyframes({
  '0%': { strokeDasharray: `0, ${15.1 * 2 * Math.PI}` },
  '100%': { strokeDasharray: `${15.1 * 2 * Math.PI}, 0` },
});

const Notifications: React.FC = () => {
  const { classes } = useStyles();
  const [toastKey, setToastKey] = useState(0);

  useNuiEvent<NotificationProps>('notify', (data) => {
    if (!data.title && !data.description) return;

    const toastId = data.id?.toString();
    const duration = data.duration || 30000;

    let iconColor: string;
    let position = data.position || 'top-center';

    data.showDuration = data.showDuration !== undefined ? data.showDuration : true;

    if (toastId) setToastKey(prevKey => prevKey + 1);

    // Backwards compat with old notifications
    switch (position) {
      case 'top':
        position = 'top-center';
        break;
      case 'bottom':
        position = 'bottom-center';
        break;
    }

    if (!data.icon) {
      switch (data.type) {
        case 'error':
          data.icon = 'circle-xmark';
          break;
        case 'success':
          data.icon = 'circle-check';
          break;
        case 'warning':
          data.icon = 'circle-exclamation';
          break;
        default:
          data.icon = 'circle-info';
          break;
      }
    }

    if (!data.iconColor) {
      switch (data.type) {
        case 'error':
          iconColor = 'red.6';
          break;
        case 'success':
          iconColor = 'teal.6';
          break;
        case 'warning':
          iconColor = 'yellow.6';
          break;
        default:
          iconColor = 'blue.6';
          break;
      }
    } else {
      iconColor = tinycolor(data.iconColor).toRgbString();
    }
    
    toast.custom((t) => (
      <div className={`${classes.container}`}>
        {/* Weather Icon */}
        <div className={`${classes.iconWrapper}`}>
          {data.icon && (
            <ThemeIcon
              color={iconColor}
              radius="xl"
              size={22}
              variant={tinycolor(iconColor).getAlpha() < 0 ? undefined : 'light'}
            >
              <LibIcon icon={data.icon} fixedWidth color={iconColor} animation={data.iconAnimation} />
            </ThemeIcon>

          )}
        </div>
        
        <div className={`${classes.textWrapper}`}>
          <p className={`${classes.title}`}>{data.title} </p>
          <p className={`${classes.description}`}>{data.description} </p>
        </div>
    
        {/* Auto-dismiss after 14s */}
        <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 animate-progress"></div>
      </div>
    ), { duration: 14000 });
  });

  return <Toaster />;
};

export default Notifications;
