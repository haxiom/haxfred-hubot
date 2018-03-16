const COLOR_MAP = {
  W: '#e6e600',
  U: '#0099ff',
  B: '#444444',
  R: '#cc0000',
  G: '#009933',
  gold: '#FFD700',
  colorless: '#bfbfbf',
};

function findColor (colors) {
  if (!Array.isArray(colors) || colors.length === 0) {
    return COLOR_MAP.colorless;
  }

  if (colors.length === 1) {
    return COLOR_MAP[colors[0]];
  }

  return COLOR_MAP.gold;
}

module.exports = function sendToSlack (msg, attachments) {
  if (!Array.isArray(attachments)) {
    attachments = [attachments];
  }

  attachments = attachments.map((config) => {
    return {
      fallback: config.fallback || 'Update your slack client to use this feature.',
      actions: config.actions,
      color: findColor(config.color),
      pretext: config.pretext,
      author_name: config.authorName,
      author_link: config.authorLink,
      author_icon: config.authorIcon,
      title: config.title,
      title_link: config.titleLink,
      text: config.text,
      fields: config.fields,
      image_url: config.imageUrl,
      thumb_url: config.thumbUrl,
      footer: config.footer,
      footer_icon: config.footerIcon,
      ts: config.ts
    }
  });

  msg.robot.adapter.client.web.chat.postMessage(msg.message.room, '', {
    username: process.env.HUBOT_SLACK_BOTNAME,
    icon_emoji: ':whispergear-sneak:',
    attachments
  });
};
