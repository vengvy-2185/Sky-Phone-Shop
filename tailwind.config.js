export default {
  content:['./index.html','./src/**/*.{js,jsx}'],
  darkMode:'class',
  theme:{extend:{
    keyframes:{
      fadeUp:{'0%':{opacity:0,transform:'translateY(24px) scale(.97)'},'100%':{opacity:1,transform:'none'}},
      float:{'0%,100%':{transform:'translateY(0) rotate(-1deg)'},'50%':{transform:'translateY(-12px) rotate(1deg)'}},
      blob:{'0%,100%':{transform:'translate(0,0) scale(1)'},'50%':{transform:'translate(40px,-30px) scale(1.15)'}},
      shine:{'0%':{backgroundPosition:'0% 50%'},'100%':{backgroundPosition:'300% 50%'}},
      pop:{'0%':{transform:'scale(.6)',opacity:0},'100%':{transform:'scale(1)',opacity:1}}},
    animation:{fadeUp:'fadeUp .6s ease both',float:'float 5s ease-in-out infinite',blob:'blob 12s ease-in-out infinite',pop:'pop .25s ease both'}}},
  plugins:[]}
