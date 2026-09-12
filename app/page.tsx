'use client';

import { useEffect, useState } from 'react';

const memories = [
  { src: './images/jellyfish.jpg', number: '01', title: '像一场安静的烟花', text: '水母在蓝色里缓缓漂浮，那一刻，时间也变得很轻。' },
  { src: './images/beluga.jpg', number: '02', title: '一起等它游过', text: '隔着人群看见白鲸，也把这一小段蓝色的记忆留了下来。' },
  { src: './images/forest.jpg', number: '03', title: '走进会呼吸的森林', text: '灯光落在树叶和水面上，像误入了另一个秘密世界。' },
  { src: './images/lizard.jpg', number: '04', title: '还有这位小小探险家', text: '认真晒太阳的样子，让普通的一天也多了一点可爱。' },
];

function Sparkles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="sparkles" aria-hidden="true">
      {Array.from({ length: 42 }, (_, index) => (
        <i key={index} style={{
          '--x': `${(index * 37) % 100}vw`,
          '--delay': `${(index % 9) * 0.08}s`,
          '--drift': `${(index % 2 ? 1 : -1) * (20 + (index % 5) * 8)}px`,
          '--color': ['#ffd27d', '#f5a7bb', '#9be5f4', '#ffffff'][index % 4],
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [wishLit, setWishLit] = useState(false);

  useEffect(() => {
    document.body.style.overflow = opened ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [opened]);

  const lightWish = () => {
    setWishLit(false);
    window.setTimeout(() => setWishLit(true), 30);
  };

  return (
    <main>
      <section className={`gift-cover ${opened ? 'gift-cover--open' : ''}`} aria-hidden={opened}>
        <img src="./images/birthday-star.jpg" alt="" className="gift-cover__image" />
        <div className="gift-cover__shade" />
        <div className="gift-cover__content">
          <p className="eyebrow">A little gift for you</p>
          <h1>有一份特别的礼物</h1>
          <p>把今天的第一份好心情，轻轻打开。</p>
          <button type="button" onClick={() => setOpened(true)}>打开礼物 <span aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section className="hero" id="top">
        <div className="hero__glow hero__glow--one" />
        <div className="hero__glow hero__glow--two" />
        <div className="hero__copy reveal">
          <p className="eyebrow">Today is all about you</p>
          <h2><span>Happy</span><br />Birthday</h2>
          <p className="hero__wish">愿这一天，所有温柔与惊喜都恰好奔向你。</p>
          <a href="#memories">看看我们收藏的时光 <span aria-hidden="true">↓</span></a>
        </div>
        <figure className="hero__portrait reveal">
          <div className="hero__frame"><img src="./images/birthday-star.jpg" alt="寿星在树下抱着尤克里里" /></div>
          <figcaption>愿你永远自在、明亮，也永远保有对世界的好奇。</figcaption>
        </figure>
        <p className="hero__year" aria-hidden="true">FOR YOU</p>
      </section>

      <section className="intro-note">
        <p className="eyebrow">Our tiny universe</p>
        <h2>有些风景，因为一起看过，<br />便有了独一无二的名字。</h2>
        <p>把散落在相册里的蓝色、绿色和阳光，重新串成一条通往今天的小路。</p>
      </section>

      <section className="memories" id="memories" aria-label="一起看过的风景">
        {memories.map((memory, index) => (
          <article className={`memory memory--${index + 1}`} key={memory.src}>
            <div className="memory__photo">
              <img src={memory.src} alt={memory.title} loading="lazy" />
              <span>{memory.number}</span>
            </div>
            <div className="memory__copy">
              <p>Memory {memory.number}</p>
              <h3>{memory.title}</h3>
              <p>{memory.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="letter">
        <div className="letter__paper">
          <p className="eyebrow">A birthday note</p>
          <h2>写给今天的你</h2>
          <div className="letter__body">
            <p>又认真地生活了一岁，辛苦啦。</p>
            <p>愿新的一岁，不必总是追赶时间。想看的风景慢慢看，想做的事情大胆做，累了就停下来歇一歇。</p>
            <p>愿你眼里常有光，身边常有温柔；也愿未来还有很多很多这样的时刻——我们一起出发，一起看见，一起把平凡的日子收藏起来。</p>
            <p>生日快乐。愿所有美好，都比约定更早抵达。</p>
          </div>
          <p className="letter__sign">— 陪你看风景的人</p>
        </div>
      </section>

      <section className={`finale ${wishLit ? 'finale--lit' : ''}`}>
        <Sparkles active={wishLit} />
        <p className="eyebrow">Make a wish</p>
        <h2>{wishLit ? '愿望已经出发啦' : '最后，许个愿吧'}</h2>
        <button type="button" className="cake" onClick={lightWish} aria-label="点亮生日祝福">
          <span className="cake__flame" aria-hidden="true" /><span className="cake__candle" aria-hidden="true" />
          <span className="cake__top" aria-hidden="true" /><span className="cake__body" aria-hidden="true" />
        </button>
        <p>{wishLit ? '愿你所愿皆所得，往后的每一天都闪闪发光。' : '轻轻点一下蜡烛'}</p>
        <a href="#top" onClick={() => setWishLit(false)}>再看一遍</a>
      </section>
    </main>
  );
}
