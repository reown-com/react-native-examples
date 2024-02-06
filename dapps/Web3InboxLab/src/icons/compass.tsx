import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function SvgComponent(props: SvgProps) {
  return (
    <Svg viewBox="0 0 496 512" {...props}>
      <Path d="M225.4 233.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0 12.5-32.8 0-45.3-32.8-12.5-45.3 0zM248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm126.1 148.1l-65.9 144.3a31.9 31.9 0 01-15.8 15.8l-144.3 66c-16.7 7.6-33.8-9.6-26.2-26.2l66-144.4a31.9 31.9 0 0115.8-15.8l144.3-66c16.7-7.6 33.8 9.6 26.2 26.2z" />
    </Svg>
  );
}

export default SvgComponent;
