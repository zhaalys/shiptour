    let currentStoryIndex = 0;
    const TOTAL_STORY_CARDS = 4;
    let isSliderTransitioning = false;
    const currentUrl = window.location.href;

    function getAllStoryCards() {
      const track = document.getElementById('sliderTrack');
      return track ? Array.from(track.querySelectorAll('.story-card')) : [];
    }

    function getSliderStep() {
      const track = document.getElementById('sliderTrack');
      if (!track) return 411;
      const cards = track.querySelectorAll('.story-card');
      if (cards.length >= 2) {
        const diff = cards[1].offsetLeft - cards[0].offsetLeft;
        if (diff > 0) return diff;
      }
      const firstCard = cards[0];
      if (firstCard) {
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap || style.gap) || 26;
        return firstCard.offsetWidth + gap;
      }
      return 411;
    }

    function updateSliderUI(displayIdx) {
      const progressBar = document.getElementById('carouselProgressBar');
      const progressWrap = document.getElementById('carouselProgressWrap');
      const currentEl = document.getElementById('peopleCurrentNum');
      const totalEl = document.getElementById('peopleTotalNum');
      const prevBtn = document.getElementById('peoplePrevBtn');
      const nextBtn = document.getElementById('peopleNextBtn');
      const allCards = getAllStoryCards();

      const normalizedIdx = ((displayIdx % TOTAL_STORY_CARDS) + TOTAL_STORY_CARDS) % TOTAL_STORY_CARDS;

      if (totalEl) totalEl.textContent = TOTAL_STORY_CARDS;
      if (currentEl) currentEl.textContent = (normalizedIdx + 1);

      allCards.forEach((card, idx) => {
        card.classList.toggle('is-active', (idx % TOTAL_STORY_CARDS) === normalizedIdx);
      });

      if (progressBar && progressWrap) {
        const thumbWidthPercent = 25;
        const maxTravel = 100 - thumbWidthPercent;
        const leftPercent = (normalizedIdx / (TOTAL_STORY_CARDS - 1)) * maxTravel;

        progressBar.style.width = `${thumbWidthPercent}%`;
        progressBar.style.left = `${leftPercent}%`;
      }

      if (prevBtn) {
        prevBtn.disabled = false;
        prevBtn.classList.remove('is-disabled');
      }
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('is-disabled');
      }
    }

    function setTrackTranslate(px, animated = true) {
      const track = document.getElementById('sliderTrack');
      if (!track) return;
      if (animated) {
        track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translate3d(${px}px, 0, 0)`;
    }

    function goToSlide(targetIndex, smooth = true) {
      const track = document.getElementById('sliderTrack');
      if (!track) return;
      if (isSliderTransitioning && smooth) return;

      const step = getSliderStep();

      if (targetIndex >= TOTAL_STORY_CARDS) {
        isSliderTransitioning = true;
        currentStoryIndex = 0;
        updateSliderUI(0);
        setTrackTranslate(-(TOTAL_STORY_CARDS * step), true);

        setTimeout(() => {
          setTrackTranslate(0, false);
          isSliderTransitioning = false;
        }, 460);
        return;
      }

      if (targetIndex < 0) {
        isSliderTransitioning = true;
        setTrackTranslate(-(TOTAL_STORY_CARDS * step), false);
        track.offsetHeight;

        currentStoryIndex = TOTAL_STORY_CARDS - 1;
        updateSliderUI(currentStoryIndex);
        setTrackTranslate(-(currentStoryIndex * step), true);

        setTimeout(() => {
          isSliderTransitioning = false;
        }, 460);
        return;
      }

      if (smooth) isSliderTransitioning = true;
      currentStoryIndex = targetIndex;
      updateSliderUI(currentStoryIndex);
      setTrackTranslate(-(currentStoryIndex * step), smooth);

      if (smooth) {
        setTimeout(() => {
          isSliderTransitioning = false;
        }, 460);
      }
    }

    function prevSlide() {
      goToSlide(currentStoryIndex - 1);
    }

    function nextSlide() {
      goToSlide(currentStoryIndex + 1);
    }

    window.prevSlide = prevSlide;
    window.nextSlide = nextSlide;

    function initSlider() {
      const container = document.getElementById('sliderContainer');
      const track = document.getElementById('sliderTrack');
      const progressWrap = document.getElementById('carouselProgressWrap');
      const progressBar = document.getElementById('carouselProgressBar');
      const prevBtn = document.getElementById('peoplePrevBtn');
      const nextBtn = document.getElementById('peopleNextBtn');
      const currentEl = document.getElementById('peopleCurrentNum');

      if (!container || !track) {
        return;
      }

      if (!track.dataset.cloned) {
        const originalCards = Array.from(track.querySelectorAll('.story-card'));
        originalCards.forEach((c) => {
          const clone = c.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.setAttribute('data-clone', 'true');
          track.appendChild(clone);
        });
        track.dataset.cloned = 'true';
      }

      container.querySelectorAll('img').forEach(img => {
        img.setAttribute('draggable', 'false');
        img.ondragstart = (e) => { e.preventDefault(); return false; };
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        });
      }

      let isCardDragging = false;
      let cardStartX = 0;
      let cardDeltaX = 0;
      let cardStartTranslate = 0;

      function startCardDrag(clientX, pointerId) {
        if (isSliderTransitioning) return;
        isCardDragging = true;
        cardStartX = clientX;
        cardDeltaX = 0;
        const step = getSliderStep();
        cardStartTranslate = -(currentStoryIndex * step);
        setTrackTranslate(cardStartTranslate, false);
      }

      function moveCardDrag(clientX, pointerId) {
        if (!isCardDragging) return;
        cardDeltaX = clientX - cardStartX;
        if (Math.abs(cardDeltaX) > 6) {
          container.classList.add('is-dragging');
          try { container.setPointerCapture(pointerId); } catch(err){}
        }
        if (container.classList.contains('is-dragging')) {
          setTrackTranslate(cardStartTranslate + cardDeltaX, false);
        }
      }

      function endCardDrag(pointerId) {
        if (!isCardDragging) return;
        isCardDragging = false;
        container.classList.remove('is-dragging');
        try { container.releasePointerCapture(pointerId); } catch(err){}

        const step = getSliderStep();
        const threshold = Math.min(75, step * 0.16);

        if (cardDeltaX < -threshold) {
          nextSlide();
        } else if (cardDeltaX > threshold) {
          prevSlide();
        } else {
          goToSlide(currentStoryIndex, true);
        }

        setTimeout(() => {
          cardDeltaX = 0;
        }, 120);
      }

      container.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        startCardDrag(e.clientX, e.pointerId);
      });
      window.addEventListener('pointermove', (e) => {
        moveCardDrag(e.clientX, e.pointerId);
      });
      window.addEventListener('pointerup', (e) => {
        endCardDrag(e.pointerId);
      });
      window.addEventListener('pointercancel', (e) => {
        endCardDrag(e.pointerId);
      });

      if (!('PointerEvent' in window)) {
        container.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          startCardDrag(e.clientX, -1);
        });
        window.addEventListener('mousemove', (e) => {
          moveCardDrag(e.clientX, -1);
        });
        window.addEventListener('mouseup', () => {
          endCardDrag(-1);
        });
      }

      container.addEventListener('click', (e) => {
        if (Math.abs(cardDeltaX) > 8) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);

      let wheelTimeout = null;
      container.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 28) {
          e.preventDefault();
          if (!wheelTimeout) {
            if (e.deltaX > 0) {
              nextSlide();
            } else {
              prevSlide();
            }
            wheelTimeout = setTimeout(() => {
              wheelTimeout = null;
            }, 420);
          }
        }
      }, { passive: false });

      if (progressWrap) {
        let isScrubbing = false;

        function handleProgressScrub(clientX, snap) {
          const rect = progressWrap.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          const thumbWidthPercent = 25;
          const leftPercent = ratio * (100 - thumbWidthPercent);

          if (progressBar) {
            progressBar.style.width = `${thumbWidthPercent}%`;
            progressBar.style.left = `${leftPercent}%`;
          }

          const targetIndex = Math.min(TOTAL_STORY_CARDS - 1, Math.max(0, Math.round(ratio * (TOTAL_STORY_CARDS - 1))));

          if (snap) {
            goToSlide(targetIndex, true);
          } else {
            const step = getSliderStep();
            const currentTranslate = -ratio * (TOTAL_STORY_CARDS - 1) * step;
            setTrackTranslate(currentTranslate, false);
            if (currentEl) currentEl.textContent = (targetIndex + 1);
          }
        }

        progressWrap.addEventListener('pointerdown', (e) => {
          isScrubbing = true;
          progressWrap.classList.add('is-scrubbing');
          try { progressWrap.setPointerCapture(e.pointerId); } catch(err){}
          handleProgressScrub(e.clientX, false);
        });

        window.addEventListener('pointermove', (e) => {
          if (!isScrubbing) return;
          handleProgressScrub(e.clientX, false);
        });

        const stopScrub = (e) => {
          if (!isScrubbing) return;
          isScrubbing = false;
          progressWrap.classList.remove('is-scrubbing');
          try { progressWrap.releasePointerCapture(e.pointerId); } catch(err){}
          handleProgressScrub(e.clientX, true);
        };

        window.addEventListener('pointerup', stopScrub);
        window.addEventListener('pointercancel', stopScrub);

        progressWrap.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextSlide();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevSlide();
          } else if (e.key === 'Home') {
            e.preventDefault();
            goToSlide(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            goToSlide(TOTAL_STORY_CARDS - 1);
          }
        });
      }

      window.addEventListener('resize', () => {
        goToSlide(currentStoryIndex, false);
      });

      window.addEventListener('load', () => {
        goToSlide(currentStoryIndex, false);
      });

      goToSlide(0, false);
    }

    window.addEventListener('message', (event) => {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) {}
      }
      if (data && (data.action === 'SET_IFRAME_HEIGHT' || data.type === 'hsFormCallback' || data.eventName === 'onFormReady')) {
        const iframe = document.getElementById('hubspotFormIframe');
        const h = data.value || data.height || (data.data && data.data.height);
        if (iframe && h) {
          iframe.style.height = `${Math.max(Number(h) + 10, 750)}px`;
          iframe.style.overflow = 'hidden';
        }
      }
    });

    const SCRIPT_POST_URL = 'https://script.google.com/macros/s/AKfycbw8_ZoHFc7YNzaD72BTth2SAViTxRIjWGtScl1_fANkgCm0HO95j81N_F58U6ERoeflyA/exec';
    const SCRIPT_GET_URL  = 'https://script.google.com/macros/s/AKfycbw8_ZoHFc7YNzaD72BTth2SAViTxRIjWGtScl1_fANkgCm0HO95j81N_F58U6ERoeflyA/exec?action=get';

    // CDN URLs for both canvas (via fetch+blob) and preview (direct <img src>)
    const CLIMATE_ICON = 'https://www.greenpeace.org/static/planet4-indonesia-stateless/2026/10/7dc979d1-issue-accents-climate-justice.png';
    const ENERGY_ICON  = 'https://www.greenpeace.org/static/planet4-indonesia-stateless/2026/10/44979689-issue-accents-energy.png';
    const FOREST_ICON  = 'https://www.greenpeace.org/static/planet4-indonesia-stateless/2026/10/a5117197-issue-accents-forest.png';
    const OCEAN_ICON   = 'https://www.greenpeace.org/static/planet4-indonesia-stateless/2026/10/be74725d-issue-accents-ocean.png';
    const ISSUE_ICON_MAP = {
      'Issue-Accents-Climate-Justice.png': CLIMATE_ICON,
      'Issue-Accents-Energy.png':          ENERGY_ICON,
      'Issue-Accents-Forest.png':          FOREST_ICON,
      'Issue-Accents-Ocean.png':           OCEAN_ICON,
      'issue-accents-ocean.png':           OCEAN_ICON,
      'issue-accents-forest.png':          FOREST_ICON,
      'issue-accents-energy.png':          ENERGY_ICON,
      'issue-accents-climate-justice.png': CLIMATE_ICON,
      'be74725d-issue-accents-ocean.png':  OCEAN_ICON,
      'a5117197-issue-accents-forest.png': FOREST_ICON,
      '44979689-issue-accents-energy.png': ENERGY_ICON,
      '7dc979d1-issue-accents-climate-justice.png': CLIMATE_ICON,
    };
    const DEFAULT_ICON = OCEAN_ICON;

    function resolveIcon(imageValue) {
      if (!imageValue) return DEFAULT_ICON;
      const key = String(imageValue).trim();
      if (ISSUE_ICON_MAP[key]) return ISSUE_ICON_MAP[key];
      const lower = key.toLowerCase();
      if (lower.includes('climate') || lower.includes('climat')) return ISSUE_ICON_MAP['Issue-Accents-Climate-Justice.png'];
      if (lower.includes('energy'))  return ISSUE_ICON_MAP['Issue-Accents-Energy.png'];
      if (lower.includes('forest'))  return ISSUE_ICON_MAP['Issue-Accents-Forest.png'];
      if (lower.includes('ocean'))   return ISSUE_ICON_MAP['Issue-Accents-Ocean.png'];
      if (key.startsWith('http'))    return ISSUE_ICON_MAP[key] || DEFAULT_ICON;
      return DEFAULT_ICON;
    }

    let communityPostcards = [];
    let currentUserPostcard = null;
    let activeModalPostcard = null;
    let shareIdx = 0;
    let marqueeAutoPausedUntil = 0;

    function loadPostcards() {
      const parseResponse = async (res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (_) {
          const m = text.match(/"postcards"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
          if (m) return { postcards: JSON.parse(m[1]) };
          const arr = text.match(/\{[\s\S]*\}/);
          if (arr) {
            try { return JSON.parse(arr[0]); } catch (_) {}
          }
          throw new Error('Unparseable response');
        }
      };

      const strategies = [
        () => fetch(SCRIPT_GET_URL, { cache: 'no-store', redirect: 'follow' }).then(parseResponse),
        () => fetch('/wp-json/shiptour/v1/postcards').then(parseResponse),
        () => new Promise((resolve, reject) => {
          const cbName = '__shiptourCb_' + Date.now();
          const script = document.createElement('script');
          const url = SCRIPT_GET_URL + '&callback=' + cbName;
          let settled = false;
          window[cbName] = (data) => {
            settled = true;
            delete window[cbName];
            script.remove();
            resolve(data);
          };
          script.src = url;
          script.onerror = () => {
            settled = true;
            delete window[cbName];
            script.remove();
            reject(new Error('JSONP failed'));
          };
          document.head.appendChild(script);
          setTimeout(() => {
            if (!settled) {
              delete window[cbName];
              script.remove();
              reject(new Error('JSONP timeout'));
            }
          }, 8000);
        }),
      ];

      return strategies.reduce((promise, strategy) =>
        promise.catch(() => strategy())
      , Promise.reject()).then(data => {
          if (!data) return;
          let list = Array.isArray(data) ? data : (data.postcards || data.data || null);
          if (!Array.isArray(list) || list.length === 0) return;

          const seen = new Set();
          const deduped = [];
          list.forEach(c => {
            if (!c) return;
            const key = [String(c.name || '').trim().toLowerCase(), String(c.message || '').trim().toLowerCase(), String(c.country || '').trim().toLowerCase()].join('|');
            if (seen.has(key)) return;
            seen.add(key);
            deduped.push(c);
          });
          const final = deduped
            .filter(c => c && (String(c.message || '').trim() !== '' || String(c.name || '').trim() !== ''))
            .reverse();
          if (final.length > 0 && JSON.stringify(final) !== JSON.stringify(communityPostcards)) {
            communityPostcards = final;
            renderMarquee();
          }
        })
        .catch(err => {
        });
    }

    let postcardFetchInFlight = false;

    function initPostcards() {
      const doFetch = () => {
        if (postcardFetchInFlight) return;
        postcardFetchInFlight = true;
        loadPostcards().finally(() => { postcardFetchInFlight = false; });
      };

      doFetch();
      setTimeout(doFetch, 1500);
      setTimeout(doFetch, 4000);
      setTimeout(doFetch, 10000);
      setInterval(doFetch, 60000);
    }

    function initShareArrows() {
      const sharePrevBtn = document.getElementById('sharePrevBtn');
      const shareNextBtn = document.getElementById('shareNextBtn');
      if (!sharePrevBtn || !shareNextBtn) return;

      const updateShareView = () => {
        const allPosts = communityPostcards;
        if (!allPosts || allPosts.length === 0) return;
        const post = allPosts[shareIdx];
        if (!post) return;
        const preview = document.getElementById('modalPostcardPreview');
        if (!preview) return;
        const msgDisplay = preview.querySelector('.postcard-message-display');
        const nameBox = preview.querySelectorAll('.m-field-box');
        if (msgDisplay) msgDisplay.textContent = post.message || '';
        if (nameBox.length >= 1) nameBox[0].textContent = post.name || '';
        if (nameBox.length >= 2) nameBox[1].textContent = post.country || '';
        if (nameBox.length >= 3) nameBox[2].textContent = post.recipient || '';
        const imgUrl = resolveIcon(post.image || '');
        const stampImg = preview.querySelector('.stamp-box img');
        if (stampImg) stampImg.src = imgUrl;
        activeModalPostcard = post;
        const prefilled = document.getElementById('prefilledShareText');
        if (prefilled) prefilled.innerText = getBioText(post);
      };

      sharePrevBtn.onclick = () => {
        const allPosts = communityPostcards;
        if (!allPosts || allPosts.length < 2) return;
        shareIdx = (shareIdx - 1 + allPosts.length) % allPosts.length;
        updateShareView();
      };
      shareNextBtn.onclick = () => {
        const allPosts = communityPostcards;
        if (!allPosts || allPosts.length < 2) return;
        shareIdx = (shareIdx + 1) % allPosts.length;
        updateShareView();
      };
    }

    let marqueeDragLockUntil = 0;

    function initMarqueeArrows() {
      const container = document.getElementById('marqueeContainer');
      const prevBtn = document.getElementById('marqueePrevBtn');
      const nextBtn = document.getElementById('marqueeNextBtn');
      if (!container || !prevBtn || !nextBtn) return;

      const cardWidth = () => {
        const card = container.querySelector('.marquee-card');
        return card ? card.offsetWidth + 16 : 300;
      };

      const pauseAuto = (ms = 3000) => {
        marqueeAutoPausedUntil = Date.now() + ms;
      };

      prevBtn.addEventListener('click', () => {
        pauseAuto();
        container.scrollBy({ left: -cardWidth(), behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        pauseAuto();
        container.scrollBy({ left: cardWidth(), behavior: 'smooth' });
      });
    }

    function initMarqueeDrag() {
      const container = document.getElementById('marqueeContainer');
      if (!container) return;

      let isDown = false;
      let startX = 0;
      let startScroll = 0;
      let autoPaused = false;
      let lastMove = 0;

      container.addEventListener('mousedown', (e) => {
        isDown = true;
        autoPaused = true;
        marqueeAutoPausedUntil = Date.now() + 5000;
        startX = e.pageX - container.offsetLeft;
        startScroll = container.scrollLeft;
        e.preventDefault();
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.4;
        container.scrollLeft = startScroll - walk;
        lastMove = Date.now();
        marqueeAutoPausedUntil = Date.now() + 5000;
      });

      document.addEventListener('mouseup', () => { isDown = false; });
      container.addEventListener('wheel', () => { lastMove = Date.now(); marqueeAutoPausedUntil = Date.now() + 5000; }, { passive: true });
      container.addEventListener('mouseenter', () => { autoPaused = true; });
      container.addEventListener('mouseleave', () => { autoPaused = false; lastMove = Date.now(); });

      requestAnimationFrame(function autoScrollFrame() {
        const now = Date.now();
        const idleMs = 2500;

        if (!isDown && !autoPaused && now - lastMove > idleMs) autoPaused = false;

        const manualLocked = now < marqueeAutoPausedUntil;

        if (!isDown && !autoPaused && !manualLocked && container.scrollWidth > container.clientWidth) {
          const max = container.scrollWidth - container.clientWidth;
          container.scrollLeft += 0.5;
          if (container.scrollLeft >= max) {
            container.scrollLeft = 0;
          }
        }
        requestAnimationFrame(autoScrollFrame);
      });
    }

    function renderMarquee() {
      const track = document.getElementById('marqueeTrack');
      const container = document.getElementById('marqueeContainer');
      const outerWrap = document.getElementById('marqueeOuterWrap');
      if (!track || !container) return;

      if (outerWrap) outerWrap.style.display = 'block';
      track.innerHTML = '';
      track.style.display = 'flex';
      track.style.justifyContent = 'flex-start';
      track.style.margin = '0';
      container.scrollLeft = 0;

      let listToRender = (communityPostcards && communityPostcards.length > 0) ? communityPostcards : [];

      listToRender.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'marquee-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Postcard from ${item.name || 'Supporter'}`);
        card.innerHTML = `
          <div class="m-card-left">
            <span class="m-card-label">MESSAGE*</span>
            <div class="m-card-message">${escapeHtml(item.message)}</div>
          </div>
          <div class="m-card-right">
            <div class="m-stamp-wrap">
              <div class="m-stamp">
                <img src="${resolveIcon(item.image)}" alt="issue icon" style="width:100%;height:100%;object-fit:contain;display:block;">
              </div>
            </div>
            <div class="m-form-group">
              <span class="m-field-label">NAME*</span>
              <div class="m-field-box">${escapeHtml(item.name || 'Anonymous')}</div>
            </div>
            <div class="m-form-group">
              <span class="m-field-label">COUNTRY*</span>
              <div class="m-field-box">${escapeHtml(item.country || 'Supporter')}</div>
            </div>
            <div class="m-form-group">
              <span class="m-field-label">RECIPIENT</span>
              <div class="m-field-box">${escapeHtml(item.recipient || 'Impacted Community in PH')}</div>
            </div>
          </div>
        `;
        card.addEventListener('click', () => {
          if (typeof openShareModal === 'function') openShareModal(item);
        });
        track.appendChild(card);
      });
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function handleMessageSubmit() {
      const name = document.getElementById('senderName').value.trim();
      const email = document.getElementById('senderEmail').value.trim();
      const country = document.getElementById('senderCountry').value;
      const recipient = document.getElementById('messageRecipient').value;
      const message = document.getElementById('messageContent').value.trim();
      const issueIconEl = document.getElementById('issueIcon');
      const image = issueIconEl ? (issueIconEl.value || '').trim() : '';
      const submitBtn = document.querySelector('.btn-send');

      if (!name || !email || !country || !recipient || !message) {
        alert('Please fill out all required fields.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'COLLECTING...';
      }

      const postcardData = { name, email, country, recipient, message, image, timestamp: new Date().toISOString() };
      currentUserPostcard = postcardData;

      fetch(SCRIPT_POST_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, country, recipient, message, image })
      });

      communityPostcards.unshift({ name, country, recipient, message, image });

      document.getElementById('userMessageDisplay').innerText = `"${message}"`;
      document.getElementById('userNameDisplay').innerText = name;
      document.getElementById('userCountryDisplay').innerText = country;
      document.getElementById('userRecipientDisplay').innerText = recipient;
      const userStampImg = document.getElementById('userStampImg');
      if (userStampImg) userStampImg.src = resolveIcon(image);

      const thankyouSection = document.getElementById('thankyouSection');
      thankyouSection.style.display = 'block';

      renderMarquee();

      thankyouSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'SEND';
      }
    }

    function resetPostcardForm() {
      const thankYou = document.getElementById('thankyouSection');
      if (thankYou) thankYou.style.display = 'none';
      const msgSection = document.getElementById('message');
      if (msgSection) msgSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openCurrentUserModal() {
      if (currentUserPostcard) {
        openShareModal(currentUserPostcard);
      }
    }

    // Cache for blob URLs so we don't refetch the same image
    const _blobCache = {};

    function resolveBlobUrl(url) {
      if (!url) return null;
      if (_blobCache[url]) return _blobCache[url];
      const blobUrl = URL.createObjectURL(new Blob([], { type: 'application/octet-stream' }));
      // will be replaced once fetch completes
      fetch(url).then(r => { if (r.ok) return r.blob(); throw new Error('fetch failed'); })
        .then(blob => {
          URL.revokeObjectURL(blobUrl);
          const realUrl = URL.createObjectURL(blob);
          _blobCache[url] = realUrl;
        })
        .catch(() => {});
      return blobUrl;
    }

    function loadImg(src) {
      return new Promise((resolve) => {
        if (!src) return resolve(null);
        // If it's already a blob URL (same-origin, canvas-safe), load directly
        if (src.startsWith('blob:')) {
          const img = new Image();
          img.onload  = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
          return;
        }
        // For remote URLs, convert to blob URL first (canvas-safe)
        const blobUrl = resolveBlobUrl(src);
        if (!blobUrl) return resolve(null);
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        };
        img.src = blobUrl;
      });
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
      const words = String(text || '').split(/\s+/);
      let line = '', lines = 0;
      const allLines = [];
      for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          allLines.push(line);
          line = words[i];
          lines++;
          if (lines >= maxLines) break;
        } else {
          line = test;
        }
      }
      if (lines < maxLines) allLines.push(line);
      if (allLines.length > maxLines) {
        allLines.length = maxLines;
        const last = allLines[maxLines - 1];
        const words2 = last.split(/\s+/);
        while (words2.length > 1 && ctx.measureText(words2.join(' ') + '…').width > maxWidth) {
          words2.pop();
        }
        allLines[maxLines - 1] = words2.join(' ') + (String(text || '').length > words2.join(' ').length ? '…' : '');
      }
      allLines.forEach((ln) => {
        ctx.fillText(ln, x, y);
        y += lineHeight;
      });
    }

    function getBioText(data) {
      const shareUrl = 'https://act.gp/rw-shiptour2026';
      return `Join with me to share our hope to local communities and Indigenous People fighting for their rights and protecting our natural environment from as fossil extraction here ${shareUrl}\n#RisingTogetherSEA`;
    }

    function drawProceduralLimeBackground(ctx, W, H) {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#b8f205');
      grad.addColorStop(0.5, '#abeb00');
      grad.addColorStop(1, '#9ee200');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      const creases = [
        [[0, 80], [420, 260], [W, 180]],
        [[120, 0], [300, H], [520, H]],
        [[580, 0], [740, 380], [W, 520]],
        [[0, 480], [520, 360], [820, H]],
        [[W - 200, 0], [W - 400, 400], [W, H - 100]],
        [[0, 300], [280, 520], [600, 460]],
        [[350, 0], [650, 240], [W, 310]]
      ];

      creases.forEach((pts) => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pts[0][0] + 1.5, pts[0][1] + 1.5);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + 1.5, pts[i][1] + 1.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    }

    function drawRainbowWarriorStamp(ctx, x, y, w, h) {
      ctx.fillStyle = '#f4f7ff';
      ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
      ctx.strokeStyle = '#0038ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
      ctx.setLineDash([]);

      const cx = x + w / 2;
      const cy = y + h * 0.38;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe600';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy + 10, 18, Math.PI, 0, false);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0038ff';
      ctx.stroke();

      ctx.fillStyle = '#0038ff';
      ctx.font = 'bold 9px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RAINBOW', cx, y + h - 22);
      ctx.fillStyle = '#111827';
      ctx.fillText('WARRIOR', cx, y + h - 11);
      ctx.fillStyle = '#ff5733';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('2026-2027', cx, y + h - 2);
      ctx.textAlign = 'left';
    }

    function generatePostcardCanvas(data) {
      const W = 1156, H = 717;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Remote URLs — loadImg() converts them to blob URLs so canvas stays clean
      const bgUrl = 'https://www.greenpeace.org/static/planet4-indonesia-stateless/2026/10/1443eee0-sea_ship-tour-2026-2027-05-postcard.jpg';
      const iconUrl = resolveIcon(data && data.image);

      return Promise.all([loadImg(bgUrl), loadImg(iconUrl)]).then(([bgImg, iconImg]) => {
        let useBg = bgImg;
        ctx.clearRect(0, 0, W, H);
        if (useBg) {
          try {
            ctx.drawImage(useBg, 0, 0, W, H);
          } catch(e) {
            useBg = null;
          }
        }
        if (!useBg) {
          drawProceduralLimeBackground(ctx, W, H);
        }

        // Center Blue Divider
        const midX = 578;
        ctx.beginPath();
        ctx.moveTo(midX, 42);
        ctx.lineTo(midX, 675);
        ctx.strokeStyle = '#0038ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Left Column (MESSAGE)
        const leftX = 58;
        const msgTop = 98;
        const leftW = midX - leftX - 22;
        const msgH = 675 - msgTop;

        // Label MESSAGE*
        ctx.fillStyle = '#000000';
        ctx.font = '900 28px "Arial Black", Impact, "Oswald", sans-serif';
        ctx.fillText('MESSAGE*', leftX, 78);

        // White message box
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(leftX, msgTop, leftW, msgH);

        // Message text
        ctx.fillStyle = '#111827';
        ctx.font = '24px Arial, Helvetica, sans-serif';
        wrapText(ctx, (data && data.message) || '', leftX + 28, msgTop + 48, leftW - 56, 36, 14);

        // Right Column
        const rightX = midX + 22;
        const rightW = W - 58 - rightX;

        // Stamp Box
        const stampW = 104;
        const stampH = 122;
        const stampX = rightX + rightW - stampW;
        const stampY = 48;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(stampX, stampY, stampW, stampH);

        let iconDrawn = false;
        if (iconImg) {
          try {
            const pad = 8;
            const maxW = stampW - pad * 2;
            const maxH = stampH - pad * 2;
            const ratio = Math.min(maxW / iconImg.width, maxH / iconImg.height);
            const dw = iconImg.width * ratio;
            const dh = iconImg.height * ratio;
            const dx = stampX + (stampW - dw) / 2;
            const dy = stampY + (stampH - dh) / 2;
            ctx.drawImage(iconImg, dx, dy, dw, dh);
            iconDrawn = true;
          } catch(e) {
            iconDrawn = false;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(stampX, stampY, stampW, stampH);
          }
        }
        if (!iconDrawn) {
          drawRainbowWarriorStamp(ctx, stampX, stampY, stampW, stampH);
        }

        const drawField = (label, val, yPos) => {
          ctx.fillStyle = '#000000';
          ctx.font = '900 24px "Arial Black", Impact, "Oswald", sans-serif';
          ctx.fillText(label, rightX, yPos - 12);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rightX, yPos, rightW, 64);

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 24px Arial, sans-serif';
          ctx.fillText(val || '', rightX + 20, yPos + 40);
        };

        drawField('NAME*', (data && data.name) || 'Anonymous', 288);
        drawField('COUNTRY*', (data && data.country) || 'Supporter', 448);
        drawField('RECIPIENT', (data && data.recipient) || 'Impacted Community in PH', 608);

        return canvas;
      });
    }

    async function getPostcardBlob(data) {
      // Always use canvas generation to ensure pixel-perfect match
      return generatePostcardCanvas(data).then(canvas => {
        return new Promise((resolve) => {
          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/png');
        });
      }).catch(err => {
        console.error('getPostcardBlob error:', err);
        return null;
      });
    }

    function renderPostcardImage(data) {
      return generatePostcardCanvas(data).then(canvas => canvas.toDataURL('image/png')).catch(() => null);
    }

    function downloadCurrentPostcard() {
      const data = activeModalPostcard || currentUserPostcard || (communityPostcards && communityPostcards[0]) || {
        name: 'Supporter',
        country: 'Indonesia',
        recipient: 'Impacted Community in PH',
        message: 'Defend our home & protect nature!'
      };
      showCopyToast('Sedang membuat gambar kartu pos...');
      getPostcardBlob(data).then(blob => {
        if (!blob) {
          showCopyToast('Gagal membuat gambar kartu pos.');
          return;
        }
        const cleanName = ((data && data.name) || 'supporter').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const filename = `postcard-${cleanName}.png`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1200);
        showCopyToast('Gambar kartu pos berhasil diunduh!');
      });
    }

    function shareToWhatsApp() {
      const data = activeModalPostcard || currentUserPostcard || (communityPostcards && communityPostcards[0]);
      const bioText = getBioText(data);
      const cleanName = ((data && data.name) || 'supporter').toLowerCase().replace(/[^a-z0-9]/g, '-');

      showCopyToast('Menyiapkan gambar kartu pos...');

      getPostcardBlob(data).then(blob => {
        if (!blob) {
          const encoded = encodeURIComponent(bioText);
          window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
          return;
        }

        const file = new File([blob], `postcard-${cleanName}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'Rainbow Warrior Postcard',
            text: bioText,
            files: [file]
          }).catch(err => {
            if (err.name !== 'AbortError') {
              fallbackWhatsAppDesktop(blob, bioText, cleanName);
            }
          });
        } else {
          fallbackWhatsAppDesktop(blob, bioText, cleanName);
        }
      });
    }

    function fallbackWhatsAppDesktop(blob, bioText, cleanName) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `postcard-${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1200);

      if (navigator.clipboard && window.ClipboardItem) {
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).catch(() => {});
        } catch(e) {}
      }

      const encoded = encodeURIComponent(bioText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
      showCopyToast('Gambar diunduh & disalin! Tempel (Ctrl+V) langsung di chat WhatsApp.');
    }

    function shareToInstagram() {
      const data = activeModalPostcard || currentUserPostcard || (communityPostcards && communityPostcards[0]);
      const bioText = getBioText(data);
      const cleanName = ((data && data.name) || 'supporter').toLowerCase().replace(/[^a-z0-9]/g, '-');

      showCopyToast('Menyiapkan gambar kartu pos...');

      getPostcardBlob(data).then(blob => {
        if (!blob) {
          if (navigator.clipboard) navigator.clipboard.writeText(bioText);
          window.open('https://www.instagram.com/', '_blank');
          return;
        }

        const file = new File([blob], `postcard-${cleanName}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'Rainbow Warrior Postcard',
            text: bioText,
            files: [file]
          }).catch(err => {
            if (err.name !== 'AbortError') {
              fallbackInstagramDesktop(blob, bioText, cleanName);
            }
          });
        } else {
          fallbackInstagramDesktop(blob, bioText, cleanName);
        }
      });
    }

    function fallbackInstagramDesktop(blob, bioText, cleanName) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `postcard-${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1200);

      if (navigator.clipboard) {
        navigator.clipboard.writeText(bioText).catch(() => {});
      }

      window.open('https://www.instagram.com/', '_blank');
      showCopyToast('Gambar diunduh & caption disalin! Silakan posting di Instagram.');
    }

    function shareToX() {
      const data = activeModalPostcard || currentUserPostcard || (communityPostcards && communityPostcards[0]);
      const bioText = getBioText(data);
      const cleanName = ((data && data.name) || 'supporter').toLowerCase().replace(/[^a-z0-9]/g, '-');

      getPostcardBlob(data).then(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `postcard-${cleanName}.png`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1200);
        }
        const encoded = encodeURIComponent(bioText);
        window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
        showCopyToast('Gambar kartu pos diunduh & teks disiapkan untuk X!');
      });
    }

    function shareToThreads() {
      const data = activeModalPostcard || currentUserPostcard || (communityPostcards && communityPostcards[0]);
      const bioText = getBioText(data);
      const cleanName = ((data && data.name) || 'supporter').toLowerCase().replace(/[^a-z0-9]/g, '-');

      getPostcardBlob(data).then(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `postcard-${cleanName}.png`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1200);
        }
        const encoded = encodeURIComponent(bioText);
        window.open(`https://www.threads.net/intent/post?text=${encoded}`, '_blank');
        showCopyToast('Gambar kartu pos diunduh & teks disiapkan untuk Threads!');
      });
    }

    function openShareModal(data) {
      activeModalPostcard = data;
      const preview = document.getElementById('modalPostcardPreview');
      const overlay = document.getElementById('shareModalOverlay');
      if (!preview || !overlay) return;
      if (data && data.message !== undefined) {
        preview.innerHTML = `
          <div class="modal-postcard-container">
            <div class="postcard-left">
              <label class="postcard-label" style="font-size:0.8rem; margin-bottom:4px;">MESSAGE*</label>
              <div class="postcard-message-display" style="font-size:0.9rem; padding:12px 14px;">${escapeHtml(data.message)}</div>
            </div>
            <div class="postcard-right">
              <div class="stamp-wrap">
                <div class="stamp-box" style="width:52px; height:62px;">
                  <img src="${resolveIcon(data.image)}" alt="issue icon" style="width:100%;height:100%;object-fit:contain;display:block;">
                </div>
              </div>
              <div class="m-form-group" style="margin-top:8px;">
                <span class="m-field-label" style="font-size:0.75rem;">NAME*</span>
                <div class="m-field-box" style="height:32px; font-size:0.88rem; padding:0 10px;">${escapeHtml(data.name)}</div>
              </div>
              <div class="m-form-group" style="margin-top:6px;">
                <span class="m-field-label" style="font-size:0.75rem;">COUNTRY*</span>
                <div class="m-field-box" style="height:32px; font-size:0.88rem; padding:0 10px;">${escapeHtml(data.country)}</div>
              </div>
              <div class="m-form-group" style="margin-top:6px;">
                <span class="m-field-label" style="font-size:0.75rem;">RECIPIENT</span>
                <div class="m-field-box" style="height:32px; font-size:0.88rem; padding:0 10px;">${escapeHtml(data.recipient || '')}</div>
              </div>
            </div>
          </div>
        `;
      }

      const prefilled = document.getElementById('prefilledShareText');
      if (prefilled) prefilled.innerText = getBioText(data);

      overlay.style.display = 'flex';
      overlay.style.setProperty('display', 'flex', 'important');

      const allPosts = (communityPostcards && communityPostcards.length > 0) ? communityPostcards : [];
      if (allPosts.length > 0) {
        const startIdx = allPosts.findIndex(p => p.name === data.name && p.message === data.message);
        shareIdx = startIdx >= 0 ? startIdx : 0;
      } else {
        shareIdx = 0;
      }
      initShareArrows();
    }

    function closeShareModal(event) {
      const overlay = document.getElementById('shareModalOverlay');
      if (!overlay) return;
      if (event && event.target && event.target !== overlay && !event.target.classList.contains('modal-close-btn')) {
        return;
      }
      overlay.style.display = 'none';
      overlay.style.setProperty('display', 'none', 'important');
    }

    function showCopyToast(msg) {
      const toast = document.getElementById('copyToast');
      if (!toast) return;
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2800);
    }

    window.prevSlide = prevSlide;
    window.nextSlide = nextSlide;
    window.closeShareModal = closeShareModal;
    window.downloadCurrentPostcard = downloadCurrentPostcard;
    window.shareToWhatsApp = shareToWhatsApp;
    window.shareToX = shareToX;
    window.shareToThreads = shareToThreads;
    window.shareToInstagram = shareToInstagram;
    window.openShareModal = openShareModal;
    window.openCurrentUserModal = openCurrentUserModal;
    window.resetPostcardForm = resetPostcardForm;
    window.initPostcards = initPostcards;
    window.renderMarquee = renderMarquee;
    window.initSlider = initSlider;
    window.goToSlide = goToSlide;

    let _initAllDone = false;
    function initAll() {
      if (_initAllDone) return;
      _initAllDone = true;
      initSlider();
      renderMarquee();
      initMarqueeArrows();
      initMarqueeDrag();
      initPostcards();
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
