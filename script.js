const pageWrapper = document.querySelector('.page-wrapper');
    let firstChoice = null;
    let mapZoomTimer = null;

    function choose(person) {
      if (!firstChoice) {
        firstChoice = person;

        if (person === 'groom') {
          const wrapper = document.querySelector('.page-wrapper');
          const bride = document.getElementById('page-bride');
          const groom = document.getElementById('page-groom');
          wrapper.insertBefore(groom, bride);
        }
      }

      selectTrack(1);
      goTo(person);
    }

    function scrollNext() {
      const target = firstChoice || 'bride';
      goTo(target);
    }

    function nextFromBride() {
      selectTrack(2);
      goTo(firstChoice === 'bride' ? 'groom' : 'date');
    }

    function nextFromGroom() {
      selectTrack(2);
      goTo(firstChoice === 'groom' ? 'bride' : 'date');
    }

    function goTo(target) {
      clearTimeout(mapZoomTimer);

      const sections = Array.from(document.querySelectorAll('.page-wrapper > .page'));
      const index = sections.findIndex(section => section.id === `page-${target}`);
      const currentPage = document.documentElement.getAttribute('data-page') || 'intro';

      // ================= SPECIAL: DATE → MAP cloud cover → transition → clouds part =================
      if (currentPage === 'date' && target === 'menu') {
        const cloudOverlay = document.getElementById('cloud-transition-overlay');
        const app = document.querySelector('.app');
        const currentIndex = sections.findIndex(section => section.id === `page-${currentPage}`);

        // Keep DATE as the active page first
        document.documentElement.setAttribute('data-page', currentPage);

        // Reset states
        app.classList.remove('map-revealed');
        pageWrapper.classList.remove('no-transition', 'zooming-map', 'cloud-fading');
        cloudOverlay.classList.remove('active', 'exiting');

        // Make sure the DATE page is still visible before clouds move
        if (currentIndex !== -1) {
          pageWrapper.classList.add('no-transition');
          pageWrapper.style.transform = `translateY(-${currentIndex * 100}svh) scale(1)`;

          requestAnimationFrame(() => {
            pageWrapper.classList.remove('no-transition');
          });
        }

        // Step 1: Clouds cover the DATE page
        requestAnimationFrame(() => {
          cloudOverlay.classList.add('active');
        });

        // Step 2: After clouds fully cover the screen, switch to MAP behind the clouds
        setTimeout(() => {
          document.documentElement.setAttribute('data-page', target);
          document.documentElement.style.setProperty('--page-index', index);

          document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));

          pageWrapper.classList.add('no-transition');
          pageWrapper.style.transform = `translateY(-${index * 100}svh) scale(1)`;

          requestAnimationFrame(() => {
            pageWrapper.classList.remove('no-transition');
            app.classList.add('map-revealed');
          });
        }, 1400);

        // Step 3: Clouds part and reveal the MAP page
        setTimeout(() => {
          cloudOverlay.classList.remove('active');
          cloudOverlay.classList.add('exiting');
        }, 2550);

        // Step 4: Fade out clouds after they part
        setTimeout(() => {
          cloudOverlay.classList.add('fade-out');
        }, 3450);

        // Step 5: Clean up animation classes
        mapZoomTimer = setTimeout(() => {
          cloudOverlay.classList.remove('active', 'exiting', 'fade-out');

          pageWrapper.classList.add('no-transition');
          pageWrapper.style.transform = `translateY(-${index * 100}svh) scale(1)`;

          requestAnimationFrame(() => {
            pageWrapper.classList.remove('no-transition');
          });
        }, 4300);

        return;
      }

      // ================= MAP OVERLAY transitions: venue / gifts / dress / rsvp =================
      const app = document.querySelector('.app');
      const overlayTargets = ['venue', 'gifts', 'dress', 'rsvp'];
      const menuIndex = sections.findIndex(section => section.id === 'page-menu');

      if (overlayTargets.includes(target)) {
        // Keep page state as menu so the background does not change.
        document.documentElement.setAttribute('data-page', 'menu');

        if (menuIndex !== -1) {
          document.documentElement.style.setProperty('--page-index', menuIndex);
          pageWrapper.classList.add('no-transition');
          pageWrapper.style.transform = `translateY(-${menuIndex * 100}svh) scale(1)`;

          requestAnimationFrame(() => {
            pageWrapper.classList.remove('no-transition', 'zooming-map', 'cloud-fading');
          });
        }

        // Keep map visible, then blur it.
        app.classList.add('map-revealed', 'overlay-open');

        // Hide all overlays first.
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));

        // Show selected overlay.
        const overlay = document.getElementById(`page-${target}`);
        if (overlay) {
          overlay.classList.remove('hidden');
        }

        return;
      }

      // ================= BACK TO MAP from overlay: unblur only =================
      if (target === 'menu' && app.classList.contains('overlay-open')) {
        document.documentElement.setAttribute('data-page', 'menu');

        if (menuIndex !== -1) {
          document.documentElement.style.setProperty('--page-index', menuIndex);
          pageWrapper.classList.add('no-transition');
          pageWrapper.style.transform = `translateY(-${menuIndex * 100}svh) scale(1)`;

          requestAnimationFrame(() => {
            pageWrapper.classList.remove('no-transition', 'zooming-map', 'cloud-fading');
          });
        }

        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        app.classList.add('map-revealed');
        app.classList.remove('overlay-open');

        return;
      }

      // Set page normally for all other transitions
      document.documentElement.setAttribute('data-page', target);

      // ================= NORMAL transitions =================
      if (index !== -1) {
        document.documentElement.style.setProperty('--page-index', index);
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));

        app.classList.remove('overlay-open');
        pageWrapper.classList.remove('no-transition', 'zooming-map', 'cloud-fading');

        if (target === 'menu') {
          app.classList.add('map-revealed');
          pageWrapper.classList.add('zooming-map');
          pageWrapper.style.transform = `translateY(-${index * 100}svh) scale(1.08)`;

          mapZoomTimer = setTimeout(() => {
            pageWrapper.classList.add('no-transition');
            pageWrapper.style.transform = `translateY(-${index * 100}svh) scale(1)`;

            requestAnimationFrame(() => {
              pageWrapper.classList.remove('no-transition', 'zooming-map');
            });
          }, 1250);
        } else {
          app.classList.remove('map-revealed');
          pageWrapper.style.transform = `translateY(-${index * 100}svh) scale(1)`;
        }
      } else {
        document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        document.getElementById(`page-${target}`)?.classList.remove('hidden');
        app.classList.remove('map-revealed', 'overlay-open');
      }
    }

    // ================= MOBILE-FIRST AUDIO ENGINE (WEB AUDIO, SYNCED + SMOOTH LOOP) =================
    // Replaces multiple independent <audio> clocks with one AudioContext clock.
    // This is much more stable on mobile/iPhone.
    const trackSources = [
      'assets/music/Banjo.mp3',
      'assets/music/Harmonica.mp3',
      'assets/music/Whistling.mp3',
      'assets/music/Flute.mp3',
      'assets/music/Drums.mp3',
      'assets/music/Piano_Solanum.mp3',
      'assets/music/Theremin_Prisoner.mp3',
    ];

    const TRACK_MAX_VOLUMES = [
      0.09, // Banjo.mp3
      0.09, // Harmonica.mp3
      0.09, // Whistling.mp3
      0.12, // Flute.mp3
      0.09, // Drums.mp3
      0.03, // Piano_Solanum.mp3
      0.09, // Theremin_Prisoner.mp3
    ];

    const FADE_DURATION = 6000;
    const MANUAL_LOOP_SECONDS = 41.858; // Optional: set to 42 if you want to force an exact 42-second cycle.
    const LOOP_SAFETY_TRIM_SECONDS = 0.02; // Tiny trim avoids MP3 encoder padding clicks at the very end.
    const LOOP_START_FADE_SECONDS = 0.10; // Fade-in at the start of each loop cycle.
    const LOOP_END_FADE_SECONDS = 0.10; // Fade-out at the end of each loop cycle.
    const LOOP_CROSSFADE_SECONDS = 0.10; // Tiny boundary overlap to avoid dead silence between cycles.
    const SCHEDULE_AHEAD_SECONDS = 3;

    let audioContext = null;
    let audioBuffers = [];
    let trackGains = [];
    let musicStarted = false;
    let musicLoadingPromise = null;
    let schedulerTimer = null;
    let nextLoopTime = 0;
    let loopInterval = 0;
    let currentTrackIndex = -1;

    const loadingScreen = document.getElementById('music-loading-screen');
    const loadingLeafFill = document.getElementById('music-loading-leaf-fill');
    const loadingOpenButton = document.getElementById('music-open-button');
    let loadedAudioBufferCount = 0;

    function showMusicLoading() {
      if (!loadingScreen) return;
      loadingScreen.classList.remove('hidden');
      loadingScreen.classList.add('is-loading');
      if (loadingOpenButton) loadingOpenButton.disabled = true;
      setMusicLoadingProgress(8);
    }

    function hideMusicLoading() {
      if (!loadingScreen) return;
      setMusicLoadingProgress(100);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        loadingScreen.classList.remove('is-loading');
      }, 260);
    }

    function setMusicLoadingProgress(percent) {
      const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
      const loadingLeaf = document.querySelector('.music-loading-leaf');

      if (loadingLeaf) {
        loadingLeaf.style.setProperty('--leaf-progress', `${safePercent}%`);
      }

      // Keep height updated only as a harmless fallback for older browsers.
      // The real visual fill now uses clip-path, so the base and filled icons stay perfectly aligned.
      if (loadingLeafFill) {
        loadingLeafFill.style.height = '100%';
      }
    }

    function getAudioContext() {
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContextClass();
      }
      return audioContext;
    }

    async function loadOneAudioBuffer(src, index) {
      const response = await fetch(src, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`Failed to load ${src}: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const context = getAudioContext();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);
      loadedAudioBufferCount += 1;
      setMusicLoadingProgress(8 + (loadedAudioBufferCount / trackSources.length) * 88);
      return audioBuffer;
    }

    function preloadMusicBuffers() {
      if (musicLoadingPromise) return musicLoadingPromise;

      loadedAudioBufferCount = 0;
      musicLoadingPromise = Promise.all(
        trackSources.map((src, index) => loadOneAudioBuffer(src, index))
      ).then(buffers => {
        audioBuffers = buffers;
        return buffers;
      });

      return musicLoadingPromise;
    }

    function createGainNodes() {
      const context = getAudioContext();
      if (trackGains.length) return;

      trackGains = audioBuffers.map(() => {
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(context.destination);
        return gain;
      });
    }

    function getTrackMaxVolume(index) {
      return TRACK_MAX_VOLUMES[index] ?? 0.1;
    }

    function getSharedLoopDuration() {
      const decodedDurations = audioBuffers.map(buffer => buffer.duration).filter(Boolean);
      const shortestDuration = Math.min(...decodedDurations);

      // The safest synced loop is one shared duration for every instrument.
      // MP3 files often decode with slightly different lengths because of encoder padding.
      // Using the shortest decoded duration keeps every instrument aligned and prevents overlap.
      const automaticDuration = Math.max(1, shortestDuration - LOOP_SAFETY_TRIM_SECONDS);
      const requestedDuration = Number(MANUAL_LOOP_SECONDS);

      if (Number.isFinite(requestedDuration) && requestedDuration > 0) {
        return Math.min(requestedDuration, automaticDuration);
      }

      return automaticDuration;
    }

    function getSafeCrossfadeDuration(playDuration, startFade, endFade) {
      return Math.max(0, Math.min(
        LOOP_CROSSFADE_SECONDS,
        startFade,
        endFade,
        playDuration / 6
      ));
    }

    function scheduleTrackBuffer(index, when, playDuration) {
      const context = getAudioContext();
      const buffer = audioBuffers[index];
      const trackGain = trackGains[index];

      if (!buffer || !trackGain) return;

      const source = context.createBufferSource();
      const edgeGain = context.createGain();
      const startFade = Math.min(LOOP_START_FADE_SECONDS, playDuration / 8);
      const endFade = Math.min(LOOP_END_FADE_SECONDS, playDuration / 8);

      source.buffer = buffer;
      source.connect(edgeGain);
      edgeGain.connect(trackGain);

      // IMPORTANT:
      // - Every instrument starts at the same AudioContext timestamp.
      // - Every instrument uses the same shared cycle duration.
      // - Start and end fades are now separate, so they can be tuned independently.
      // - The next cycle starts only LOOP_CROSSFADE_SECONDS before the cycle boundary.
      // - This creates a tiny smooth overlap without layering the same instrument for a long time.
      edgeGain.gain.setValueAtTime(0, when);
      edgeGain.gain.linearRampToValueAtTime(1, when + startFade);
      edgeGain.gain.setValueAtTime(1, Math.max(when + startFade, when + playDuration - endFade));
      edgeGain.gain.linearRampToValueAtTime(0, when + playDuration);

      source.start(when, 0, playDuration);
      source.stop(when + playDuration + 0.05);
    }

    function scheduleAllTracksAt(when, playDuration) {
      audioBuffers.forEach((_, index) => scheduleTrackBuffer(index, when, playDuration));
    }

    function startLoopScheduler() {
      const context = getAudioContext();

      // One shared loop duration keeps all stems locked together across every repeat.
      // The scheduling interval is slightly shorter than the play duration only by the tiny
      // crossfade value, so there is no audible dead gap at the loop boundary.
      const sharedLoopDuration = getSharedLoopDuration();
      const startFade = Math.min(LOOP_START_FADE_SECONDS, sharedLoopDuration / 8);
      const endFade = Math.min(LOOP_END_FADE_SECONDS, sharedLoopDuration / 8);
      const safeCrossfade = getSafeCrossfadeDuration(sharedLoopDuration, startFade, endFade);

      loopInterval = Math.max(0.5, sharedLoopDuration - safeCrossfade);
      nextLoopTime = context.currentTime + 0.12;

      scheduleAllTracksAt(nextLoopTime, sharedLoopDuration);
      nextLoopTime += loopInterval;

      clearInterval(schedulerTimer);
      schedulerTimer = setInterval(() => {
        while (nextLoopTime < context.currentTime + SCHEDULE_AHEAD_SECONDS) {
          scheduleAllTracksAt(nextLoopTime, sharedLoopDuration);
          nextLoopTime += loopInterval;
        }
      }, 500);
    }

    function fadeTrackGain(index, targetVolume, duration = FADE_DURATION) {
      const context = getAudioContext();
      const gain = trackGains[index];
      if (!gain) return;

      const now = context.currentTime;
      const fadeSeconds = Math.max(0.05, duration / 1000);
      const currentValue = gain.gain.value;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(currentValue, now);
      gain.gain.linearRampToValueAtTime(targetVolume, now + fadeSeconds);
    }

    async function startMusic() {
      const context = getAudioContext();
      await context.resume();

      if (musicStarted) {
        selectTrack(0);
        return;
      }

      await preloadMusicBuffers();
      createGainNodes();
      startLoopScheduler();

      musicStarted = true;
      selectTrack(0);
    }

    async function startExperience(target = 'couple') {
      showMusicLoading();

      try {
        await startMusic();
        hideMusicLoading();
        if (target) goTo(target);
      } catch (error) {
        console.warn('Music could not be prepared. Continuing without music.', error);
        hideMusicLoading();
        if (target) goTo(target);
      }
    }

    function selectTrack(index) {
      if (index < 0 || index >= trackSources.length) return;

      // If user taps another page before music has started, start the full engine first.
      if (!musicStarted) {
        startExperience(null);
        return;
      }

      const targetVolume = getTrackMaxVolume(index);
      fadeTrackGain(index, targetVolume, FADE_DURATION);
      currentTrackIndex = index;
    }

    let wasPausedByHiddenTab = false;

    async function pauseMusicForHiddenTab() {
      if (!musicStarted || !audioContext) return;

      try {
        if (audioContext.state === 'running') {
          wasPausedByHiddenTab = true;
          await audioContext.suspend();
        }
      } catch (error) {
        console.warn('Could not suspend audio when tab was hidden.', error);
      }
    }

    async function resumeMusicAfterHiddenTab() {
      if (!musicStarted || !audioContext || !wasPausedByHiddenTab) return;

      try {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        wasPausedByHiddenTab = false;
      } catch (error) {
        console.warn('Could not resume audio automatically.', error);

        // Some mobile browsers require user interaction before audio can resume again.
        const resumeOnNextTap = async () => {
          try {
            if (audioContext && audioContext.state === 'suspended') {
              await audioContext.resume();
            }
            wasPausedByHiddenTab = false;
          } catch (e) {
            console.warn('Audio resume after tap failed.', e);
          }

          document.removeEventListener('touchstart', resumeOnNextTap);
          document.removeEventListener('click', resumeOnNextTap);
        };

        document.addEventListener('touchstart', resumeOnNextTap, { once: true });
        document.addEventListener('click', resumeOnNextTap, { once: true });
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseMusicForHiddenTab();
      } else {
        resumeMusicAfterHiddenTab();
      }
    });

    // Extra support for iOS Safari / mobile browsers
    window.addEventListener('pagehide', () => {
      pauseMusicForHiddenTab();
    });

    window.addEventListener('pageshow', () => {
      if (!document.hidden) {
        resumeMusicAfterHiddenTab();
      }
    });

    // ================= INVITATION TYPE + LANGUAGE + COUPLE NAME LOGIC =================
    // Link examples:
    // Family:  index.html?type=family&to=Bapak%20Ahmad%20dan%20Ibu
    // Friends: index.html?type=friends&to=Rina
    // General: index.html?type=general
    // Work:    index.html?type=work

    const params = new URLSearchParams(window.location.search);
    const rawInvitationType = (params.get('type') || 'general').trim().toLowerCase();
    const guest = params.get('to');

    function normalizeInvitationType(type) {
      return type
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    function decodeGuestName(value) {
      return decodeURIComponent(value.replace(/\+/g, ' ')).trim();
    }

    const invitationType = normalizeInvitationType(rawInvitationType);

    const isFamily = invitationType === 'family';
    const isFriends = invitationType === 'friends' || invitationType === 'friend';
    const isWork = invitationType === 'work';
    const isGeneral = invitationType === 'general' || (!isFamily && !isFriends && !isWork);

    const language = isFamily ? 'id' : 'en';

    const couple = isFriends
      ? {
          display: 'Hanif & Amel',
          text: 'Hanif and Amel',
          groom: 'Hanif',
          bride: 'Amel',
          // Bride/Groom detail pages use full government names.
          // Update these two values with the exact legal names when finalized.
          groomFullGovernmentName: 'Muhammad Hanif Atthariq',
          brideFullGovernmentName: 'Winda (Amel) Natakusumah'
        }
      : {
          display: 'Hanif & Winda',
          text: 'Hanif dan Winda',
          groom: 'Hanif',
          bride: 'Winda',
          // Bride/Groom detail pages use full government names.
          // Update these two values with the exact legal names when finalized.
          groomFullGovernmentName: 'Muhammad Hanif Atthariq',
          brideFullGovernmentName: 'Winda Natakusumah'
        };

    // Replace these placeholder names when the final parent names are available.
    const parents = {
      groomFather: 'Bapak Pudjo Prasetyo',
      groomMother: 'Ibu Efda R. Bandini',
      brideFather: 'Bapak Hidayat Natakusumah',
      brideMother: 'Ibu Wini Dewi Kania'
    };

    const guestNameTitle = document.getElementById('guest-name');
    const rsvpGuestName = document.getElementById('rsvp-guest-name');
    const formGuestName = document.getElementById('form-guest-name');
    const guestNameField = document.getElementById('guest-name-field');

    function setText(id, text) {
      const element = document.getElementById(id);
      if (element) element.innerText = text;
    }

    function setHTML(id, html) {
      const element = document.getElementById(id);
      if (element) element.innerHTML = html;
    }

    function fitSingleLineName(id) {
      const element = document.getElementById(id);
      if (!element) return;

      const app = document.querySelector('.app');
      const parent = element.parentElement;
      const appWidth = app ? app.getBoundingClientRect().width : window.innerWidth;
      const parentWidth = parent ? parent.getBoundingClientRect().width : appWidth;
      const availableWidth = Math.max(220, Math.min(appWidth - 40, parentWidth - 16, 360));

      element.style.display = 'block';
      element.style.boxSizing = 'border-box';
      element.style.width = `${availableWidth}px`;
      element.style.maxWidth = `${availableWidth}px`;
      element.style.marginLeft = 'auto';
      element.style.marginRight = 'auto';
      element.style.paddingLeft = '0';
      element.style.paddingRight = '0';
      element.style.textAlign = 'center';
      element.style.whiteSpace = 'nowrap';
      element.style.overflow = 'visible';
      element.style.textOverflow = 'clip';
      element.style.transform = 'translateX(0)';

      // Reset to CSS-defined max size before measuring.
      element.style.fontSize = '';

      let computed = window.getComputedStyle(element);
      let size = parseFloat(computed.fontSize);
      const maxSize = size;
      const minSize = 11; // px, keeps long full names on one centered line.

      const textWidth = () => element.scrollWidth;

      let guard = 0;
      while (textWidth() > availableWidth && size > minSize && guard < 160) {
        size -= 0.5;
        element.style.fontSize = `${size}px`;
        guard += 1;
      }

      // If the name is short, keep the original CSS size.
      if (textWidth() <= availableWidth && size > maxSize) {
        element.style.fontSize = `${maxSize}px`;
      }
    }

    function fitBrideGroomNames() {
      fitSingleLineName('bride-name');
      fitSingleLineName('groom-name');
    }

    function applyInvitationImages() {
      const images = isFamily
        ? {
            intro: "url('assets/intro1.webp')",
            couple: 'assets/couple1.webp',
            bride: 'assets/bride1.webp'
          }
        : {
            intro: "url('assets/intro.webp')",
            couple: 'assets/couple.webp',
            bride: 'assets/bride.webp'
          };

      document.documentElement.style.setProperty('--opening-bg-image', images.intro);

      const couplePhoto = document.getElementById('couple-photo');
      if (couplePhoto) couplePhoto.src = images.couple;

      const bridePhoto = document.getElementById('bride-photo');
      if (bridePhoto) bridePhoto.src = images.bride;
    }

    function applyInvitationContext() {
      const hasSpecificName = Boolean(guest);
      const name = hasSpecificName ? decodeGuestName(guest) : '';

      document.documentElement.setAttribute('data-lang', language);
      applyInvitationImages();

      setText('music-loading-title', couple.display);
      setText('music-open-button', 'Open');

      setText('intro-couple-name', couple.display);
      setText('couple-title', couple.display);
      setText('couple-script', language === 'id'
        ? `Dengan memohon Rahmat dan Ridho Allah Subhanahu Wa Ta'ala kami bermaksud untuk mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami`
        : `${couple.text} are excited to share this special day with you.`
      );

      setText('bride-name', couple.brideFullGovernmentName);
      document.querySelector('img[alt="Bride"]')?.setAttribute('alt', `${couple.bride} - Bride`);

      if (language === 'id') {
        document.documentElement.lang = 'id';

        setText('intro-dear-label', 'Yth. Bapak/Ibu');
        setText('guest-name', name || 'Tamu Undangan');
        setText('intro-subtitle', 'Are getting married');
        setText('intro-button', 'Meet the Couple');

        setText('couple-description', 'Assalamu àlaikum warohmatullahi wabarokatuh');
        setText('couple-button', 'Continue');

        setText('bride-role', 'Mempelai Wanita');
        setHTML('bride-parent-line', `Putri dari<br><span>${parents.brideFather}</span><span class="parent-separator">&</span><span>${parents.brideMother}</span>`);
        setText('bride-desc-1', `Mempelai wanita yang anggun.`);
        setText('bride-desc-2', `${couple.bride} membawa kehangatan di setiap momen.`);
        setText('bride-button', 'Continue');

        setText('groom-role', 'Mempelai Pria');
        setText('groom-name', couple.groomFullGovernmentName);
        setHTML('groom-parent-line', `Putra dari<br><span>${parents.groomFather}</span><span class="parent-separator">&</span><span>${parents.groomMother}</span>`);
        setText('groom-desc-1', `Mempelai pria yang penuh kasih.`);
        setText('groom-desc-2', `${couple.groom} siap memulai babak baru kehidupan.`);
        setText('groom-button', 'Continue');

        setText('date-subtitle', 'Simpan tanggalnya');
        setHTML('countdown-days-label', '<span id="days">0</span>Hari');
        setHTML('countdown-hours-label', '<span id="hours">0</span>Jam');
        setHTML('countdown-minutes-label', '<span id="minutes">0</span>Menit');
        setHTML('countdown-seconds-label', '<span id="seconds">0</span>Detik');
        setText('date-schedule-title', 'Jadwal Acara');
        setText('date-schedule-wedding', 'Akad Nikah');
        setText('date-schedule-reception', 'Resepsi');
        setText('date-button', 'Explore');

        setText('venue-title', 'Lokasi Acara');
        setHTML('venue-address', '150 Coffee Garden<br/>Bandung, Indonesia');
        setText('map-cta', '📍 Buka di Google Maps');
        setText('venue-back-button', 'Back to Map');

        setText('gifts-title', 'Gifts');
        setText('gifts-description', 'Doa dan kehadiran Bapak/Ibu merupakan hadiah terbaik bagi kami. Jika berkenan memberikan tanda kasih, silakan gunakan detail di bawah.');
        setText('gift-groom-transfer-label', 'Rekening Mempelai Pria');
        setText('gift-groom-bank-account-label', 'Bank / No. Rekening');
        setText('gift-groom-holder-label', 'Nama Rekening');
        setText('gift-bride-transfer-label', 'Rekening Mempelai Wanita');
        setText('gift-bride-bank-account-label', 'Bank / No. Rekening');
        setText('gift-bride-holder-label', 'Nama Rekening');
        setText('gift-wishlist-label', 'Wishlist');
        setText('gift-wishlist-note', 'Bapak/Ibu juga dapat melihat wishlist kami melalui tautan berikut.');
        setText('gift-wishlist-button', 'Buka Wishlist');
        setText('gift-groom-copy-button', 'Salin Nomor');
        setText('gift-bride-copy-button', 'Salin Nomor');
        setText('gifts-back-button', 'Back to Map');

        setText('dress-title', 'Dress Code');
        setText('dress-description', 'Pakaian formal dengan nuansa warna earth tone.');
        setText('dress-no-heels', 'No high heels.');
        setText('dress-back-button', 'Back to Map');

        setText('rsvp-title', 'RSVP');
        setHTML('rsvp-greeting', `Yth. Bapak/Ibu <strong id="rsvp-guest-name">${name || 'Tamu Undangan'}</strong>,`);
        setText('guest-name-label', 'Nama');
        formGuestName.placeholder = 'Masukkan nama Anda';

        setText('attendance-label', 'Apakah Bapak/Ibu akan hadir?');
        setText('attendance-empty', 'Pilih');
        setText('attendance-yes', 'Ya, dengan senang hati');
        setText('attendance-no', 'Mohon maaf, belum bisa hadir');

        setText('guest-count-label', 'Jumlah tamu');
        setText('guest-count-empty', 'Pilih');
        setText('message-label', 'Ucapan / Pesan');
        setText('rsvp-submit-button', 'Kirim RSVP');
        setText('rsvp-back-button', 'Back to Map');

        setText('modal-title', 'Terima Kasih!');
        setText('modal-description', 'Konfirmasi kehadiran Anda berhasil dikirim.');
        setText('modal-button', 'Back to Map');
      } else {
        document.documentElement.lang = 'en';

        setText('intro-dear-label', 'Dear');
        setText('guest-name', name || (isWork ? 'Keluarga Besar SPC' : 'Our Beloved Guest'));
        setText('intro-subtitle', 'Are getting married');
        setText('intro-button', 'Meet the Couple');

        setText('couple-description', 'Two souls united by love, embarking on a beautiful journey together.');
        setText('couple-button', 'Continue');

        setText('bride-role', 'The Bride');
        setHTML('bride-parent-line', `Daughter of<br><span>${parents.brideFather}</span><span class="parent-separator">&</span><span>${parents.brideMother}</span>`);
        setText('bride-desc-1', `The beautiful bride, radiant and full of grace.`);
        setText('bride-desc-2', `${couple.bride} brings joy and warmth to every moment.`);
        setText('bride-button', 'Continue');

        setText('groom-role', 'The Groom');
        setText('groom-name', couple.groomFullGovernmentName);
        setHTML('groom-parent-line', `Son of<br><span>${parents.groomFather}</span><span class="parent-separator">&</span><span>${parents.groomMother}</span>`);
        setText('groom-desc-1', 'The charming groom, strong and kind-hearted.');
        setText('groom-desc-2', `${couple.groom} is ready to start this new chapter.`);
        setText('groom-button', 'Continue');

        setText('date-subtitle', 'Save the date');
        setHTML('countdown-days-label', '<span id="days">0</span>Days');
        setHTML('countdown-hours-label', '<span id="hours">0</span>Hours');
        setHTML('countdown-minutes-label', '<span id="minutes">0</span>Minutes');
        setHTML('countdown-seconds-label', '<span id="seconds">0</span>Seconds');
        setText('date-schedule-title', 'Schedule');
        setText('date-schedule-wedding', 'Wedding');
        setText('date-schedule-reception', 'Reception');
        setText('date-button', 'Explore');

        setText('venue-title', 'Wedding Venue');
        setHTML('venue-address', '150 Coffee Garden<br/>Bandung, Indonesia');
        setText('map-cta', '📍 Open in Google Maps');
        setText('venue-back-button', 'Back to Map');

        setText('gifts-title', 'Gifts');
        setText('gifts-description', 'Your presence and prayers are the greatest gift. If you would like to send a gift or blessing, you may use the details below.');
        setText('gift-groom-transfer-label', 'Groom Bank Account');
        setText('gift-groom-bank-account-label', 'Bank / Account No.');
        setText('gift-groom-holder-label', 'Account Name');
        setText('gift-bride-transfer-label', 'Bride Bank Account');
        setText('gift-bride-bank-account-label', 'Bank / Account No.');
        setText('gift-bride-holder-label', 'Account Name');
        setText('gift-wishlist-label', 'Wishlist');
        setText('gift-wishlist-note', 'You may also view our wishlist through the link below.');
        setText('gift-wishlist-button', 'Open Wishlist');
        setText('gift-groom-copy-button', 'Copy Number');
        setText('gift-bride-copy-button', 'Copy Number');
        setText('gifts-back-button', 'Back to Map');

        setText('dress-title', 'Dress Code');
        setText('dress-description', 'Formal attire in earth tone color schemes.');
        setText('dress-no-heels', 'No high heels.');
        setText('dress-back-button', 'Back to Map');

        setText('rsvp-title', 'RSVP');
        setHTML('rsvp-greeting', `Dear <strong id="rsvp-guest-name">${name || (isWork ? 'Keluarga Besar SPC' : 'Our Guest')}</strong>,`);
        setText('guest-name-label', 'Your Name');
        formGuestName.placeholder = 'Enter your name';

        setText('attendance-label', 'Will you attend?');
        setText('attendance-empty', 'Select');
        setText('attendance-yes', 'Yes, happily');
        setText('attendance-no', 'Sorry, can’t make it');

        setText('guest-count-label', 'Number of guests');
        setText('guest-count-empty', 'Select');
        setText('message-label', 'Message');
        setText('rsvp-submit-button', 'Send RSVP');
        setText('rsvp-back-button', 'Back to Map');

        setText('modal-title', 'Thank You!');
        setText('modal-description', 'Your RSVP has been sent successfully.');
        setText('modal-button', 'Back to Map');
      }

      const updatedRsvpGuestName = document.getElementById('rsvp-guest-name');

      if (hasSpecificName) {
        formGuestName.value = name;
        formGuestName.defaultValue = name;
        formGuestName.required = false;
        guestNameField.style.display = 'none';

        if (updatedRsvpGuestName) {
          updatedRsvpGuestName.innerText = name;
        }
      } else {
        formGuestName.value = '';
        formGuestName.defaultValue = '';
        formGuestName.required = true;
        guestNameField.style.display = 'block';

        if (updatedRsvpGuestName) {
          updatedRsvpGuestName.innerText = language === 'id' ? 'Tamu Undangan' : (isWork ? 'Keluarga Besar SPC' : 'Our Guest');
        }
      }

      requestAnimationFrame(fitBrideGroomNames);
      requestAnimationFrame(() => {
        updateGuestCountAvailability();
        updateRsvpSubmitState();
      });

    }


    async function copyGiftAccount(accountNumberId, buttonId) {
      const accountElement = document.getElementById(accountNumberId);
      const button = document.getElementById(buttonId);
      if (!accountElement || !button) return;

      const number = accountElement.innerText.trim();
      const originalText = button.innerText;
      const copiedText = language === 'id' ? 'Tersalin' : 'Copied';
      const failedText = language === 'id' ? 'Gagal' : 'Failed';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(number);
        } else {
          const tempInput = document.createElement('textarea');
          tempInput.value = number;
          tempInput.setAttribute('readonly', '');
          tempInput.style.position = 'fixed';
          tempInput.style.opacity = '0';
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        button.innerText = copiedText;
      } catch (error) {
        console.warn('Could not copy account number.', error);
        button.innerText = failedText;
      }

      setTimeout(() => {
        button.innerText = originalText;
      }, 1400);
    }


    // Replace native RSVP select dropdowns with themed dropdowns.
    // The original select elements are kept for form submission compatibility.
    function closeAllThemeSelects(except = null) {
      document.querySelectorAll('.theme-select.is-open').forEach(wrapper => {
        if (wrapper !== except) wrapper.classList.remove('is-open');
      });
    }

    function syncThemeSelect(select) {
      const wrapper = select.nextElementSibling;
      if (!wrapper || !wrapper.classList.contains('theme-select')) return;

      const selectedOption = select.options[select.selectedIndex];
      const valueText = selectedOption ? selectedOption.text : '';
      const valueSpan = wrapper.querySelector('.theme-select-value');
      const hasValue = Boolean(select.value);
      const isDisabled = Boolean(select.disabled);
      const triggerButton = wrapper.querySelector('.theme-select-button');

      valueSpan.textContent = valueText || (language === 'id' ? 'Pilih' : 'Select');
      valueSpan.classList.toggle('theme-select-placeholder', !hasValue);
      wrapper.classList.toggle('has-error', false);
      wrapper.classList.toggle('is-disabled', isDisabled);
      wrapper.classList.remove('is-open');

      if (triggerButton) {
        triggerButton.disabled = isDisabled;
        triggerButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
        triggerButton.setAttribute('aria-expanded', 'false');
      }

      wrapper.querySelectorAll('.theme-select-option').forEach(button => {
        button.disabled = isDisabled;
        button.classList.toggle('is-selected', button.dataset.value === select.value && hasValue);
      });
    }

    function buildThemeSelect(select) {
      if (!select || select.dataset.themeSelectReady === 'true') return;

      const wasRequired = select.required;
      if (wasRequired) {
        select.dataset.required = 'true';
        select.required = false;
      }

      select.classList.add('theme-select-original');
      select.dataset.themeSelectReady = 'true';

      const wrapper = document.createElement('div');
      wrapper.className = 'theme-select';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-select-button';
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = '<span class="theme-select-value"></span><span class="theme-select-arrow">⌄</span>';

      const menu = document.createElement('div');
      menu.className = 'theme-select-menu';
      menu.setAttribute('role', 'listbox');

      Array.from(select.options).forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.className = 'theme-select-option';
        optionButton.dataset.value = option.value;
        optionButton.textContent = option.text;
        optionButton.setAttribute('role', 'option');

        const chooseOption = event => {
          event.preventDefault();
          event.stopPropagation();
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          syncThemeSelect(select);
          wrapper.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
        };

        optionButton.addEventListener('click', chooseOption);
        optionButton.addEventListener('touchend', chooseOption, { passive: false });

        menu.appendChild(optionButton);
      });

      button.addEventListener('click', event => {
        event.stopPropagation();
        if (select.disabled) return;
        const willOpen = !wrapper.classList.contains('is-open');
        closeAllThemeSelects(wrapper);
        wrapper.classList.toggle('is-open', willOpen);
        button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      wrapper.appendChild(button);
      wrapper.appendChild(menu);
      select.insertAdjacentElement('afterend', wrapper);
      select.addEventListener('change', () => syncThemeSelect(select));
      syncThemeSelect(select);
    }

    function enhanceThemeSelects() {
      document.querySelectorAll('#page-rsvp select').forEach(buildThemeSelect);
      updateGuestCountAvailability();
    }

    function updateGuestCountAvailability() {
      const attendanceSelect = document.getElementById('attendance-select');
      const guestCountSelect = document.getElementById('guest-count-select');
      if (!attendanceSelect || !guestCountSelect) return;

      const isNotAttending = attendanceSelect.value === 'Sorry, can’t make it';

      // Guest count is optional. It is only enabled when the guest is attending,
      // but it must never block the RSVP submission.
      if (isNotAttending) {
        guestCountSelect.value = '';
        guestCountSelect.disabled = true;
      } else {
        guestCountSelect.disabled = false;
      }

      guestCountSelect.dataset.required = 'false';
      syncThemeSelect(guestCountSelect);
      updateRsvpSubmitState();
    }

    function getRsvpRequiredState() {
      const nameInput = document.getElementById('form-guest-name');
      const attendanceSelect = document.getElementById('attendance-select');

      const guestName = nameInput ? nameInput.value.trim() : '';
      const attendance = attendanceSelect ? attendanceSelect.value.trim() : '';

      return {
        hasGuestName: Boolean(guestName),
        hasAttendance: Boolean(attendance),
        guestName,
        attendance
      };
    }

    function updateRsvpSubmitState() {
      const submitButton = document.getElementById('rsvp-submit-button');
      if (!submitButton) return;

      const state = getRsvpRequiredState();
      const isSubmitting = submitButton.dataset.submitting === 'true';
      const canSubmit = state.hasGuestName && state.hasAttendance && !isSubmitting;

      submitButton.disabled = !canSubmit;
      submitButton.setAttribute('aria-disabled', canSubmit ? 'false' : 'true');
    }

    function clearRsvpValidationErrors() {
      document.getElementById('form-guest-name')?.classList.remove('has-error');
      document.querySelectorAll('#page-rsvp .theme-select.has-error').forEach(wrapper => {
        wrapper.classList.remove('has-error');
      });
    }

    function validateRsvpRequiredFields() {
      clearRsvpValidationErrors();

      const nameInput = document.getElementById('form-guest-name');
      const attendanceSelect = document.getElementById('attendance-select');
      const state = getRsvpRequiredState();

      if (!state.hasGuestName) {
        nameInput?.classList.add('has-error');
        nameInput?.focus();
        return false;
      }

      if (!state.hasAttendance) {
        const wrapper = attendanceSelect?.nextElementSibling;
        if (wrapper && wrapper.classList.contains('theme-select')) {
          closeAllThemeSelects(wrapper);
          wrapper.classList.add('has-error', 'is-open');
          wrapper.querySelector('.theme-select-button')?.focus();
        } else {
          attendanceSelect?.focus();
        }
        return false;
      }

      return true;
    }

    document.getElementById('attendance-select')?.addEventListener('change', () => {
      updateGuestCountAvailability();
      updateRsvpSubmitState();
    });

    document.getElementById('form-guest-name')?.addEventListener('input', updateRsvpSubmitState);
    document.getElementById('form-guest-name')?.addEventListener('change', updateRsvpSubmitState);

    document.addEventListener('click', () => closeAllThemeSelects());

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeAllThemeSelects();
    });

    updateRsvpSubmitState();

    applyInvitationContext();
    enhanceThemeSelects();
    updateRsvpSubmitState();
    window.addEventListener('resize', fitBrideGroomNames);
    window.addEventListener('orientationchange', () => requestAnimationFrame(fitBrideGroomNames));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(fitBrideGroomNames));
    }

    const weddingDate = new Date('June 14, 2026 00:00:00').getTime();

    setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) return;

      document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
      document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);

let rsvpSubmitted = false;
    const form = document.getElementById("RSVP");
    const iframe = document.querySelector('iframe[name="hidden_iframe"]');
    const modal = document.getElementById("rsvp-modal");

    let rsvpFinished = false;

    function finishRsvpSubmission() {
      if (rsvpFinished) return;
      rsvpFinished = true;

      const submitButton = document.getElementById('rsvp-submit-button');
      if (submitButton) {
        submitButton.dataset.submitting = 'false';
      }

      modal.classList.remove("hidden");
      form.reset();
      applyInvitationContext();
      updateGuestCountAvailability();
      document.querySelectorAll('#page-rsvp select.theme-select-original').forEach(syncThemeSelect);
      rsvpSubmitted = false;
      rsvpFinished = false;
      updateRsvpSubmitState();
    }

    function submitRsvpWithHiddenIframe() {
      return new Promise(resolve => {
        let settled = false;

        const done = () => {
          if (settled) return;
          settled = true;
          iframe.removeEventListener('load', done);
          resolve();
        };

        iframe.addEventListener('load', done);
        setTimeout(done, 3500);
        HTMLFormElement.prototype.submit.call(form);
      });
    }

    async function sendRsvpFormData() {
      const formData = new FormData(form);

      // Prefer fetch no-cors because some Android built-in browsers are unreliable
      // when submitting Google Forms through a hidden iframe. The response is opaque,
      // but the POST request is still sent to Google Forms.
      if (window.fetch) {
        await fetch(form.action, {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
          keepalive: true
        });
        return;
      }

      await submitRsvpWithHiddenIframe();
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();

      if (!validateRsvpRequiredFields()) {
        updateRsvpSubmitState();
        return;
      }

      const submitButton = document.getElementById('rsvp-submit-button');
      const originalText = submitButton ? submitButton.innerText : '';

      rsvpSubmitted = true;
      if (submitButton) {
        submitButton.dataset.submitting = 'true';
        submitButton.disabled = true;
        submitButton.setAttribute('aria-disabled', 'true');
        submitButton.innerText = language === 'id' ? 'Mengirim...' : 'Sending...';
      }

      try {
        await sendRsvpFormData();
        if (submitButton) submitButton.innerText = originalText;
        finishRsvpSubmission();
      } catch (error) {
        console.warn('Fetch RSVP failed. Retrying with hidden iframe.', error);
        try {
          await submitRsvpWithHiddenIframe();
          if (submitButton) submitButton.innerText = originalText;
          finishRsvpSubmission();
        } catch (fallbackError) {
          console.warn('RSVP fallback submit failed.', fallbackError);
          if (submitButton) {
            submitButton.dataset.submitting = 'false';
            submitButton.innerText = originalText;
          }
          rsvpSubmitted = false;
          updateRsvpSubmitState();
        }
      }
    });

    iframe.addEventListener("load", () => {
      if (!rsvpSubmitted || rsvpFinished) return;
      finishRsvpSubmission();
    });

    function closeModal() {
      modal.classList.add("hidden");
      goTo('menu');
    }
