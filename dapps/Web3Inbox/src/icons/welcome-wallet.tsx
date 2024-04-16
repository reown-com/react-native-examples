import Svg, {
  Defs,
  LinearGradient,
  Mask,
  Path,
  Rect,
  Stop,
  SvgProps,
} from 'react-native-svg';

function SvgComponent(props: SvgProps) {
  return (
    <Svg width="90" height="70" viewBox="0 0 90 70" fill="none" {...props}>
      <Mask
        id="path-1-outside-1_2_220"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="90"
        height="70"
        fill="black">
        <Rect fill="white" width="90" height="70" />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1 23.4C1 15.5593 1 11.6389 2.52591 8.64413C3.86814 6.00986 6.00986 3.86814 8.64413 2.52591C11.6389 1 15.5593 1 23.4 1H56.6C64.4407 1 68.3611 1 71.3559 2.52591C73.9901 3.86814 76.1319 6.00986 77.4741 8.64413C78.601 10.8558 78.8957 13.5724 78.9727 18H58C48.6112 18 41 25.6112 41 35C41 44.3888 48.6112 52 58 52H78.9727C78.8957 56.4276 78.601 59.1442 77.4741 61.3559C76.1319 63.9901 73.9901 66.1319 71.3559 67.4741C68.3611 69 64.4407 69 56.6 69H23.4C15.5593 69 11.6389 69 8.64413 67.4741C6.00986 66.1319 3.86814 63.9901 2.52591 61.3559C1 58.3611 1 54.4407 1 46.6V23.4ZM58 22C50.8203 22 45 27.8203 45 35C45 42.1797 50.8203 48 58 48H79.7368C80.9101 48 81.4967 48 81.9895 47.9386C85.6233 47.4856 88.4856 44.6233 88.9386 40.9895C89 40.4967 89 39.9101 89 38.7368V31.2632C89 30.0899 89 29.5033 88.9386 29.0105C88.4856 25.3767 85.6233 22.5144 81.9895 22.0614C81.4967 22 80.9101 22 79.7368 22H58Z"
        />
      </Mask>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 23.4C1 15.5593 1 11.6389 2.52591 8.64413C3.86814 6.00986 6.00986 3.86814 8.64413 2.52591C11.6389 1 15.5593 1 23.4 1H56.6C64.4407 1 68.3611 1 71.3559 2.52591C73.9901 3.86814 76.1319 6.00986 77.4741 8.64413C78.601 10.8558 78.8957 13.5724 78.9727 18H58C48.6112 18 41 25.6112 41 35C41 44.3888 48.6112 52 58 52H78.9727C78.8957 56.4276 78.601 59.1442 77.4741 61.3559C76.1319 63.9901 73.9901 66.1319 71.3559 67.4741C68.3611 69 64.4407 69 56.6 69H23.4C15.5593 69 11.6389 69 8.64413 67.4741C6.00986 66.1319 3.86814 63.9901 2.52591 61.3559C1 58.3611 1 54.4407 1 46.6V23.4ZM58 22C50.8203 22 45 27.8203 45 35C45 42.1797 50.8203 48 58 48H79.7368C80.9101 48 81.4967 48 81.9895 47.9386C85.6233 47.4856 88.4856 44.6233 88.9386 40.9895C89 40.4967 89 39.9101 89 38.7368V31.2632C89 30.0899 89 29.5033 88.9386 29.0105C88.4856 25.3767 85.6233 22.5144 81.9895 22.0614C81.4967 22 80.9101 22 79.7368 22H58Z"
        fill="url(#paint0_linear_2_220)"
      />
      <Path
        d="M2.52591 8.64413L3.19416 8.98463L2.52591 8.64413ZM8.64413 2.52591L8.98463 3.19416L8.64413 2.52591ZM71.3559 2.52591L71.6964 1.85765L71.6964 1.85765L71.3559 2.52591ZM77.4741 8.64413L76.8058 8.98462L76.8058 8.98463L77.4741 8.64413ZM78.9727 18V18.75C79.1739 18.75 79.3666 18.6692 79.5076 18.5257C79.6486 18.3822 79.7261 18.1881 79.7226 17.987L78.9727 18ZM78.9727 52L79.7226 52.013C79.7261 51.8119 79.6486 51.6178 79.5076 51.4743C79.3666 51.3308 79.1739 51.25 78.9727 51.25V52ZM77.4741 61.3559L76.8058 61.0154L76.8058 61.0154L77.4741 61.3559ZM71.3559 67.4741L71.0154 66.8058L71.0154 66.8058L71.3559 67.4741ZM8.64413 67.4741L8.98463 66.8058L8.98462 66.8058L8.64413 67.4741ZM2.52591 61.3559L3.19416 61.0154L3.19416 61.0154L2.52591 61.3559ZM81.9895 47.9386L81.8968 47.1943L81.8968 47.1943L81.9895 47.9386ZM88.9386 40.9895L89.6828 41.0823L89.6828 41.0823L88.9386 40.9895ZM88.9386 29.0105L89.6828 28.9177L89.6828 28.9177L88.9386 29.0105ZM81.9895 22.0614L81.8968 22.8057L81.8968 22.8057L81.9895 22.0614ZM1.85765 8.30364C1.03185 9.92437 0.637757 11.7628 0.443229 14.1438C0.249417 16.5159 0.25 19.492 0.25 23.4H1.75C1.75 19.4673 1.75058 16.5628 1.93825 14.2659C2.1252 11.9778 2.49406 10.3587 3.19416 8.98463L1.85765 8.30364ZM8.30364 1.85765C5.52825 3.27179 3.27179 5.52825 1.85765 8.30364L3.19416 8.98463C4.46449 6.49148 6.49148 4.46449 8.98463 3.19416L8.30364 1.85765ZM23.4 0.25C19.492 0.25 16.5159 0.249417 14.1438 0.443229C11.7628 0.637757 9.92437 1.03185 8.30364 1.85765L8.98463 3.19416C10.3587 2.49406 11.9778 2.1252 14.2659 1.93825C16.5628 1.75058 19.4673 1.75 23.4 1.75V0.25ZM56.6 0.25H23.4V1.75H56.6V0.25ZM71.6964 1.85765C70.0756 1.03185 68.2372 0.637757 65.8562 0.443229C63.4841 0.249417 60.508 0.25 56.6 0.25V1.75C60.5327 1.75 63.4372 1.75058 65.7341 1.93825C68.0222 2.1252 69.6413 2.49406 71.0154 3.19416L71.6964 1.85765ZM78.1423 8.30364C76.7282 5.52825 74.4717 3.27179 71.6964 1.85765L71.0154 3.19416C73.5085 4.46449 75.5355 6.49148 76.8058 8.98462L78.1423 8.30364ZM79.7226 17.987C79.6457 13.5654 79.3566 10.6867 78.1423 8.30364L76.8058 8.98463C77.8454 11.0249 78.1457 13.5793 78.2228 18.013L79.7226 17.987ZM58 18.75H78.9727V17.25H58V18.75ZM41.75 35C41.75 26.0254 49.0254 18.75 58 18.75V17.25C48.1969 17.25 40.25 25.1969 40.25 35H41.75ZM58 51.25C49.0254 51.25 41.75 43.9746 41.75 35H40.25C40.25 44.8031 48.1969 52.75 58 52.75V51.25ZM78.9727 51.25H58V52.75H78.9727V51.25ZM78.1423 61.6964C79.3566 59.3133 79.6457 56.4346 79.7226 52.013L78.2228 51.987C78.1457 56.4207 77.8454 58.9751 76.8058 61.0154L78.1423 61.6964ZM71.6964 68.1423C74.4717 66.7282 76.7282 64.4717 78.1423 61.6964L76.8058 61.0154C75.5355 63.5085 73.5085 65.5355 71.0154 66.8058L71.6964 68.1423ZM56.6 69.75C60.508 69.75 63.4841 69.7506 65.8562 69.5568C68.2372 69.3622 70.0756 68.9682 71.6964 68.1423L71.0154 66.8058C69.6413 67.5059 68.0222 67.8748 65.7341 68.0618C63.4372 68.2494 60.5327 68.25 56.6 68.25V69.75ZM23.4 69.75H56.6V68.25H23.4V69.75ZM8.30364 68.1423C9.92437 68.9682 11.7628 69.3622 14.1438 69.5568C16.5159 69.7506 19.492 69.75 23.4 69.75V68.25C19.4673 68.25 16.5628 68.2494 14.2659 68.0618C11.9778 67.8748 10.3587 67.5059 8.98463 66.8058L8.30364 68.1423ZM1.85765 61.6964C3.27179 64.4717 5.52825 66.7282 8.30364 68.1423L8.98462 66.8058C6.49148 65.5355 4.46449 63.5085 3.19416 61.0154L1.85765 61.6964ZM0.25 46.6C0.25 50.508 0.249417 53.4841 0.443229 55.8562C0.637757 58.2372 1.03185 60.0756 1.85765 61.6964L3.19416 61.0154C2.49406 59.6413 2.1252 58.0222 1.93825 55.7341C1.75058 53.4372 1.75 50.5327 1.75 46.6H0.25ZM0.25 23.4V46.6H1.75V23.4H0.25ZM45.75 35C45.75 28.2345 51.2345 22.75 58 22.75V21.25C50.4061 21.25 44.25 27.4061 44.25 35H45.75ZM58 47.25C51.2345 47.25 45.75 41.7655 45.75 35H44.25C44.25 42.5939 50.4061 48.75 58 48.75V47.25ZM79.7368 47.25H58V48.75H79.7368V47.25ZM81.8968 47.1943C81.4618 47.2485 80.9326 47.25 79.7368 47.25V48.75C80.8875 48.75 81.5316 48.7515 82.0823 48.6828L81.8968 47.1943ZM88.1943 40.8968C87.7838 44.1899 85.1899 46.7838 81.8968 47.1943L82.0823 48.6828C86.0567 48.1874 89.1874 45.0567 89.6828 41.0823L88.1943 40.8968ZM88.25 38.7368C88.25 39.9326 88.2485 40.4618 88.1943 40.8968L89.6828 41.0823C89.7515 40.5316 89.75 39.8875 89.75 38.7368H88.25ZM88.25 31.2632V38.7368H89.75V31.2632H88.25ZM88.1943 29.1032C88.2485 29.5382 88.25 30.0674 88.25 31.2632H89.75C89.75 30.1125 89.7515 29.4684 89.6828 28.9177L88.1943 29.1032ZM81.8968 22.8057C85.1899 23.2162 87.7838 25.8101 88.1943 29.1032L89.6828 28.9177C89.1874 24.9433 86.0567 21.8126 82.0823 21.3172L81.8968 22.8057ZM79.7368 22.75C80.9326 22.75 81.4618 22.7515 81.8968 22.8057L82.0823 21.3172C81.5316 21.2485 80.8875 21.25 79.7368 21.25V22.75ZM58 22.75H79.7368V21.25H58V22.75Z"
        fill="url(#paint1_linear_2_220)"
        fillOpacity="0.5"
        mask="url(#path-1-outside-1_2_220)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_2_220"
          x1="67.6258"
          y1="-16.9712"
          x2="52.4897"
          y2="70.1271"
          gradientUnits="userSpaceOnUse">
          <Stop stopColor="white" />
          <Stop offset="1" stopColor="white" stopOpacity="0.5" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_2_220"
          x1="46"
          y1="1"
          x2="46"
          y2="69"
          gradientUnits="userSpaceOnUse">
          <Stop stopOpacity="0.05" />
          <Stop offset="1" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
