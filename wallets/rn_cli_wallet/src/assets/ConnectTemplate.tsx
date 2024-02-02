import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

const SvgConnectTemplate = (props: SvgProps) => (
  <Svg viewBox="0 0 37 33" fill="none" {...props}>
    <Path
      d="M28.1875 14.3906C28.5938 14.3906 29 14.4219 29.4062 14.4844V9.375C29.4062 6.53125 29.1094 4.3125 27.5 2.71875C25.8906 1.10938 23.6719 0.796875 20.8281 0.796875H9.10938C6.3125 0.796875 4.07812 1.125 2.48438 2.71875C0.875 4.32812 0.578125 6.53125 0.578125 9.34375V21.0469C0.578125 23.9062 0.875 26.1094 2.46875 27.7031C4.09375 29.3125 6.3125 29.625 9.15625 29.625H19.2344C18.4062 28.1562 17.9219 26.4375 17.9219 24.6406C17.9219 19.0156 22.5625 14.3906 28.1875 14.3906ZM28.1875 32.6875C32.5625 32.6875 36.2344 29.0312 36.2344 24.6406C36.2344 20.2344 32.6094 16.5938 28.1875 16.5938C23.7812 16.5938 20.1562 20.2344 20.1562 24.6406C20.1562 29.0625 23.7812 32.6875 28.1875 32.6875ZM27.2812 29C26.9844 29 26.625 28.8906 26.3906 28.6406L23.7812 25.7812C23.5781 25.5469 23.4688 25.2344 23.4688 24.9688C23.4688 24.3125 23.9844 23.8594 24.5781 23.8594C24.9375 23.8594 25.2188 24 25.4062 24.2188L27.2188 26.2031L30.9062 21.0938C31.125 20.7969 31.4531 20.6094 31.8438 20.6094C32.4375 20.6094 32.9531 21.0781 32.9531 21.7031C32.9531 21.9062 32.875 22.1406 32.7344 22.3594L28.2031 28.5938C28.0156 28.8438 27.6562 29 27.2812 29Z"
      fill={props.fill || '#9EA9A9'}
    />
  </Svg>
);
export default SvgConnectTemplate;
