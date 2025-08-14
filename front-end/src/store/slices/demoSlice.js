import preview from "../../img/demo/preview.jpg";
import incorrectVideo from "../../videos/incorrect.mp4";

import { createSlice } from "@reduxjs/toolkit";

const demoState = {
  games: [
    {
      name: "Пробная игра",
      description:
        "Попробуйте себя в роли помощника Профессора Золтана. Вам по силам провести целый день в его театре? Первые испытания ждут вас.",
      preview,

      stages: [
        {
          id: 1,
          video:
            "https://media.zoltansgametma.ru/videos/2046130786-6238.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qmIzzGlhifr5LBA1kCq4%2F20250514%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250514T193117Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=f113b9027e5faafffa4a0411a036a36f95ff49554fb6062b3fccdfe288efe952",
          description: `Текст письма: у меня, на самом то деле, нет никакой болезни. Просто мне…каждый раз трудно даётся переживать время суток после заката солнца. Я молюсь и ставлю обереги по всей квартире и даже за её пределами. Но надвигающаяся беспощадная тьма неизбежна. И у меня каждый раз ощущается дрожание рук, дрожь по всему телу и озноб, голова ужасно болит, а голос куда-то теряется. Я чувствую полную безихсодность и близость чего-то ужасного, смотрящего на меня оттуда. 
Каждый раз сон мне могут дарить только горящие лампы или свечи. Поэтому я не хожу по улицам после захода солнца, обхожу аллеи и переулки стороной даже в дневное время, ведь эта тёмная неизбежность всегда рядом. Вы можете назвать этот страх иррациональным, доктор, но что есть то есть. 
Однажды, когда в доме не было света на какое-то время, а все свечи закончились, я чуть не убил себя. Я кричал как дикое животное, впадал в кататоничнский ступор, затем снова кричал. И так до самого восхода солнца. Ибо вне его света я не могу находиться. Помогите мне научиться справляться с этой тёмной неизбежностью. Иначе однажды она убьет меня, или то, что в ней кроется…
              `,
          tips: [
            "Попробуйте описать симптомы болезни поисковику в интернете, основываясь на письме",
            "Название болезни: синдром деперсонализации-дереализации",
          ],
          answer: "Никтофобия",
          incorrect:
            "https://media.zoltansgametma.ru/videos/2046130786-6216.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qmIzzGlhifr5LBA1kCq4%2F20250514%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250514T191823Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=1018994c274d30db20ae07feaf25c0f7d2849cf2a55453bbed0fac160fd44967",
          format: "введите ответ в формате *заболевание*",
        },
        {
          id: 2,
          video:
            "https://media.zoltansgametma.ru/videos/2046130786-6343.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qmIzzGlhifr5LBA1kCq4%2F20250515%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250515T203544Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=030bbd1271f8461ceb9033e3685adc1a6956595c9a4ba2e824e26a7b2dbbdecf",
          description: "«Введите ответ в формате *1234*»",
          tips: [
            "Пароль состоит из 4 цифр, цифры спрятаны в каждом логическом фрагменте видео.",
            "Обратите внимание на пальцы, ключи, стихотворение и текст на двери.",
            "Первая цифра 4 (количество дел, которые должен сделать Джордж), вторая цифра 4 (ключи, которые остались висеть у ключника образуют силуэт цифры 4), третья цифра 1 (первые буквы строчек стихотворения), четвертая цифра 6 (Сонет 6 Уильяма Шекспира)",
          ],
          answer: "4416",
          incorrect:
            "https://media.zoltansgametma.ru/videos/2046130786-6243.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qmIzzGlhifr5LBA1kCq4%2F20250514%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250514T212543Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=bb69a4e4cbd7ee72e0a93de8a9953a471eecf05c987620a913f819f697dbd0fd",
        },
        {
          id: 3,
          video:
            "https://media.zoltansgametma.ru/videos/2046130786-6269.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qmIzzGlhifr5LBA1kCq4%2F20250514%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250514T213519Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=ba976f23f2d837108dfe0da449bef091d2ddc7256e8bfc0b451bfc525566e3f8",
          description:
            "Узнайте, куда Примадонна спрятала Джорджа. Напишите название этого места.",
          tips: [
            "Отсканируйте QR-код в глазах Примы и бродите по глубине сознания примадонны в поисках Джорджа",
            "Во всех кусках воспоминаний спрятан предмет для перехода на следующий этап",
          ],
          answer: "комнатамелка",
          incorrect: "",
        },
        {
          id: 4,
          video:
            "https://media.zoltansgametma.ru/videos/2046130786-6283.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=qmIzzGlhifr5LBA1kCq4%2F20250514%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250514T215133Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=41bb458ebbe60b28dfd68934844fb5e6e6da295591be53778f2c0629890d00ba",
          description: "Финал",
          tips: [],
          answer: "",
          incorrect: "",
        },
      ],
    },
  ],
  isOpen: false,
};
const demoSlice = createSlice({
  name: "demo",
  initialState: demoState,
  reducers: {
    setOpen: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});
export const { setOpen } = demoSlice.actions;

export default demoSlice.reducer;
