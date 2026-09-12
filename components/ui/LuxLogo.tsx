/**
 * The LUX logo — the full brand lockup, in its two halves.
 *
 * Exported verbatim from the brand master rather than redrawn: every path, every
 * gradient coordinate and every stop is the supplied artwork. Do not hand-tune
 * the geometry — retune it in the brand file and re-export.
 *
 * ⚠️ IT SHIPS AS TWO COMPONENTS, NOT ONE, AND THAT IS THE WHOLE POINT. The
 * entrance (`components/layout/LogoEntrance.tsx`) drifts the symbol in from its
 * left and the wordmark in from its right, so the two halves have to be
 * independently transformable. A single `<svg>` with two `<g>`s would have done
 * it too, but then every drift distance is in USER UNITS and cannot be
 * expressed against the element's own width — which is what keeps the gesture
 * the same size relative to the logo at 320 and at 1440. Two elements, two CSS
 * transforms, percentages that resolve against each element's own box.
 *
 * THE TWO VIEWBOXES TILE THE MASTER EXACTLY, WHICH IS WHAT MAKES THE LOCKUP
 * REASSEMBLE FOR FREE. The master is `0 0 538 173`:
 *
 *   mark  `0   0 209 173`   the symbol (spans x 0..169.3) PLUS the 39.7 of
 *                           clear space the master leaves before the L
 *   word  `209 0 329 173`   the wordmark (L, U, X — spans x 209..538)
 *
 * Laid out as two flex items at 209/538 and 329/538 of a shared width, with NO
 * gap, they render at one scale, one height, and land pixel-for-pixel on the
 * master. The gap lives inside the mark's box rather than in a CSS `gap` so the
 * two shares always sum to 1 and the lockup cannot drift as the stage resizes.
 *
 * ⚠️ THE GRADIENTS ARE `userSpaceOnUse`, SO SPLITTING THE BOX DID NOT MOVE THEM.
 * A viewBox offset maps user space to the viewport; it does not renumber user
 * space. `lux_logo_word_l` and `lux_logo_word_x` were byte-identical in the
 * master (same coordinates, same four stops) and are ONE definition here,
 * referenced twice — a de-duplication, not a redraw.
 *
 * ⚠️ EVERY ID IS PREFIXED. `Orb` already puts `lux_orb_*` gradients in the
 * document and Welcome renders both at once; SVG ids are document-global, so an
 * unprefixed `paint0_linear` from the export would collide with whatever else
 * shipped one and the fills would silently take the wrong ramp.
 *
 * ⚠️ BOTH HALVES ARE DECORATIVE — `aria-hidden`, AND NOT `role="img"` LIKE THE
 * ORB. `Orb` names itself "Lux" because it is the only thing on screen standing
 * for the AI. These are halves of a lockup: naming them would announce the
 * brand twice, in two pieces, in whatever order the DOM happens to hold them.
 * Their only caller is the entrance, which sits over a page that already has
 * its own `<h1>`. A caller that needs the lockup to carry an accessible name
 * should name the element it puts them in, not these.
 */

/** the four stops the symbol and the U share, and the master's only other ramp */
function MarkStops() {
  return (
    <>
      <stop stopColor="#60739A" />
      <stop offset="0.331731" stopColor="#4D517B" />
      <stop offset="0.504808" stopColor="#433F6B" />
      <stop offset="0.947115" stopColor="#433F6B" />
    </>
  );
}

type LogoPartProps = { className?: string };

/**
 * The symbol — three strokes of light. Its box carries the master's clear space
 * on the right, so it is 209 wide for a 169.3-wide drawing.
 */
export function LuxLogoMark({ className }: LogoPartProps) {
  return (
    <svg
      viewBox="0 0 209 173"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      <path
        d="M131.911 124.068C125.129 126.594 123.011 128.781 100.304 138.188C84.3072 144.034 74.4656 140.301 69.0026 133.511C60.3454 122.749 67.0091 108.632 81.8863 106.057C91.9077 104.842 96.8792 108.305 106.266 115.661C113.882 121.552 125.429 123.741 131.911 124.068Z"
        fill="url(#lux_logo_mark_top)"
      />
      <path
        d="M39.7419 48.4833C46.4825 45.8654 48.5657 43.6495 71.1208 33.9331C87.0237 27.8693 96.9234 31.4669 102.493 38.1823C111.32 48.824 104.881 63.0308 90.046 65.8094C80.0449 67.1611 75.0191 63.7666 65.5165 56.539C57.8085 50.753 46.2281 48.722 39.7419 48.4833Z"
        fill="url(#lux_logo_mark_bottom)"
      />
      <path
        d="M118.793 70.8399C129.151 65.264 132.103 63.9159 136.459 62.7734C138.433 62.2559 140.941 61.9926 144.044 61.9771C152.151 61.937 157.977 64.0743 162.906 68.8982C167.758 73.646 170.135 80.5512 169.275 87.3991C168.642 92.4362 166.609 96.4495 162.775 100.228C158.025 104.908 151.297 107.524 144.044 107.511C139.486 107.502 135.81 106.776 131.419 105.018C128.365 103.795 126.607 102.807 114.745 95.6482C110.234 92.9261 102.99 89.8102 98.0244 88.4562C94.7003 87.55 83.4361 87.1792 79.5623 87.8484C71.8103 89.1882 64.2986 92.1419 51.0007 99.078C34.8766 107.489 32.1085 108.462 24.2448 108.475C20.1617 108.483 18.9289 108.317 16.0609 107.378C6.06622 104.106 0 96.0077 0 85.9385C0 79.466 2.67529 73.9407 7.90131 69.6197C11.0084 67.0506 14.391 65.3024 18.3926 64.198C21.9901 63.2048 29.2037 63.2161 33.2321 64.2206C37.8052 65.3609 43.9584 68.5955 50.7887 73.4491C60.9344 80.6586 67.9641 83.7707 76.0009 84.6109C79.7517 85.0034 81.2729 84.9692 85.1788 84.4053C93.7276 83.1713 102.355 79.6896 118.793 70.8399Z"
        fill="url(#lux_logo_mark_sweep)"
      />
      <defs>
        <linearGradient
          id="lux_logo_mark_top"
          x1="128.093"
          y1="103.561"
          x2="80.8494"
          y2="177.05"
          gradientUnits="userSpaceOnUse"
        >
          <MarkStops />
        </linearGradient>
        <linearGradient
          id="lux_logo_mark_bottom"
          x1="43.8843"
          y1="68.9359"
          x2="90.0273"
          y2="-5.1477"
          gradientUnits="userSpaceOnUse"
        >
          <MarkStops />
        </linearGradient>
        <linearGradient
          id="lux_logo_mark_sweep"
          x1="62.5002"
          y1="36.4892"
          x2="121.046"
          y2="141.211"
          gradientUnits="userSpaceOnUse"
        >
          <MarkStops />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * The wordmark — L, U, X. The U is two paths in the master (one per stem) and
 * stays two here; they carry different gradient coordinates and merging them
 * would change the ramp across the letter.
 */
export function LuxLogoWord({ className }: LogoPartProps) {
  return (
    <svg
      viewBox="209 0 329 173"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      <path
        d="M211.543 143.438C209.292 136.195 209 134.877 209 64.6034V0.00540068H215.65C219.73 0.169907 224.281 1.03855 226.46 2.28482C231.546 5.19276 233.306 7.68529 235.653 12.4626C238.391 19.3171 237.573 17.5083 237.71 73.851C237.834 124.532 236.631 128.157 240.543 135.22C244.454 140.205 249.768 141.869 252.865 142.697C256.243 143.6 257.322 143.981 265.532 144.269C274.547 144.586 279.964 149.792 281.853 152.114C284.386 155.23 286.354 160.016 286.863 162.719C287.477 165.983 287.479 167.415 287.484 170.389L287.485 170.562L287.489 172.973L266.447 172.834C245.405 172.695 238.769 170.02 234.87 168.869C226.656 164.714 223.845 163.675 217.215 155.575C214.385 151.57 213.01 148.16 211.543 143.438Z"
        fill="url(#lux_logo_word_ramp)"
      />
      <path
        d="M313.546 3.58478C311.404 2.45511 308.485 1.31587 306.56 0.857433C304.662 0.405647 303.97 0.0552845 301.794 0.0349188L298 0V61.0427C298 128.215 298.046 127.596 299.992 137.571C303.094 147.516 305.764 151.076 310.54 155.802L310.591 155.859C317.77 162.097 325.773 165.84 332.742 168.328C336.758 169.762 343.676 171.87 356.164 173H359.471L362 172.975L361.959 168.847C361.893 162.184 360.123 156.071 356.341 152.148C355.345 151.116 353.247 149.188 349.162 147.226C345.992 145.704 345.115 145.244 340.797 143.693C333.566 141.095 331.46 140.264 328.933 136.729C328.025 135.097 327.669 132.176 327.669 128.203C327.669 121.757 327.763 122.496 327.557 72.9425C327.328 17.3441 327.538 21.443 324.58 14.9717C323.542 12.7016 322.359 11.0095 320.192 8.69408C317.827 6.1679 316.479 5.13091 313.546 3.58478Z"
        fill="url(#lux_logo_word_u_left)"
      />
      <path
        d="M413.455 3.58478C415.597 2.45511 418.516 1.31587 420.441 0.857433C422.338 0.405647 423.031 0.0552845 425.207 0.0349188L429 0V61.0427C429 128.215 428.954 127.596 427.009 137.571C423.906 147.516 421.236 151.076 416.461 155.802L416.41 155.859C409.231 162.097 401.227 165.84 394.258 168.328C390.243 169.762 383.324 171.87 370.836 173H367.529L365 172.975L365.041 168.847C365.107 162.184 366.877 156.071 370.66 152.148C371.655 151.116 373.754 149.188 377.839 147.226C381.008 145.704 381.885 145.244 386.204 143.693C393.434 141.095 395.54 140.264 398.068 136.729C398.975 135.097 399.332 132.176 399.332 128.203C399.332 121.757 399.237 122.496 399.443 72.9425C399.673 17.3441 399.462 21.443 402.421 14.9717C403.459 12.7016 404.641 11.0095 406.808 8.69408C409.173 6.1679 410.522 5.13091 413.455 3.58478Z"
        fill="url(#lux_logo_word_u_right)"
      />
      <path
        d="M463.561 51.8337C459.855 40.0453 448.919 1.81122 448.919 0.643061C448.919 0.0926279 449.64 0.0365567 454.298 0.225573C460.257 0.467348 462.956 1.08965 467.109 3.17963C474.314 6.80501 478.295 12.8394 481.122 24.4159C482.354 29.4617 484.726 42.7377 486.652 55.3648C490.192 78.5823 491.202 84.8431 491.606 86.0748C491.845 86.8006 492.1 87.3306 492.174 87.2521C492.567 86.8342 493.723 80.9822 495.312 71.3585C498.677 50.9776 502.416 32.5067 505.108 22.962C508.002 12.6969 512.167 6.67623 518.734 3.26188C522.841 1.12662 525.524 0.503071 531.742 0.237617L537.306 0L536.166 3.69184C535.538 5.72242 533.071 13.8331 530.682 21.7157C524.858 40.9356 519.523 57.7016 517.861 62.0116C513.085 74.3894 508.104 81.0769 500.555 85.2423C498.941 86.133 496.575 87.1823 495.296 87.5749L492.971 88.2886L496.274 89.2977C501.691 90.9527 506.464 94.0708 510.866 98.8295C516.196 104.591 519.88 112.435 525.38 129.725C529.607 143.014 538.22 172.533 537.996 172.771C537.878 172.897 535.787 173 533.348 173C527.784 173.001 523.998 172.169 519.773 169.602C515.979 167.669 512.977 164.657 510.62 160.418C506.875 153.681 504.151 143.293 496.633 107.085C494.057 94.679 492.707 88.7119 492.174 89.2977C491.247 90.3154 489.314 97.6464 485.303 117.886C482.355 132.767 478.856 147.164 476.626 153.593C475.996 155.41 474.954 157.945 474.311 159.227C470.939 165.946 464.275 171.127 456.352 172.487C453.685 172.944 446.181 173.098 446.181 172.695C446.181 172.354 454.313 144.932 457.994 133.049C459.727 127.451 462.014 120.534 463.077 117.678C465.115 112.196 467.994 106.43 470.432 102.946C472.053 100.63 476.136 96.2796 478.258 94.6067C480.775 92.6223 483.507 90.7379 487.034 89.4821C487.842 89.1945 489.406 88.9001 491.167 88.2886C488.848 87.675 480.996 83.2919 480.996 83.2919C480.996 83.2919 473.368 77.2683 468.785 67.0643C467.923 65.0848 465.572 58.2312 463.561 51.8337Z"
        fill="url(#lux_logo_word_ramp)"
      />
      <defs>
        {/* ⚠️ ONE DEFINITION, TWO USERS — the L and the X carried byte-identical
            gradients in the master (same coordinates, same three offsets). */}
        <linearGradient
          id="lux_logo_word_ramp"
          x1="377.044"
          y1="7.53426"
          x2="377.905"
          y2="240.504"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60739A" />
          <stop offset="0.186479" stopColor="#4D517B" />
          <stop offset="0.493902" stopColor="#433F6B" />
          <stop offset="0.707331" stopColor="#433F6B" />
        </linearGradient>
        <linearGradient
          id="lux_logo_word_u_left"
          x1="275.309"
          y1="31.9457"
          x2="382.48"
          y2="25.7661"
          gradientUnits="userSpaceOnUse"
        >
          <MarkStops />
        </linearGradient>
        <linearGradient
          id="lux_logo_word_u_right"
          x1="454.103"
          y1="48.5213"
          x2="351.77"
          y2="27.7365"
          gradientUnits="userSpaceOnUse"
        >
          <MarkStops />
        </linearGradient>
      </defs>
    </svg>
  );
}
