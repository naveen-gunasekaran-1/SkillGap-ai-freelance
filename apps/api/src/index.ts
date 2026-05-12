import 'dotenv/config';
import { env } from './lib/env';
import app from './app';

app.listen(env.PORT, () => {
  console.log(`SkillGap AI API listening on port ${env.PORT}`);
});
