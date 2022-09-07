const ECR_model = {
  id: "p-00000000",
  element: "pie-explicit-constructed-response",
  disabled: false,
  mode: "gather",
  prompt: "<div>This is the prompt</div>",
  shuffle: true,
  choices: {
    0: [{ label: "foo", value: "foo" }]
  },
  markup: "<div>This is slate markup {{0}}</div>"
};


const MC_model = {
  id: "1",
  element: 'pie-multiple-choice',
  shouldHaveComplexRubric: true,
  prompt:
    'Which of these northern European countries are EU members?',
  choiceMode: 'checkbox',
  keyMode: 'numbers',
  choices: [
    {
      correct: true,
      value: 'sweden',
      label: 'Sweden',
      feedback: {
        type: 'none',
        value: ''
      }
    },
    {
      value: 'iceland',
      label: 'Iceland <math style="display: block;"> <mtable columnalign="right center left"> <mtr> <mtd> <msup> <mrow> <mo> ( </mo> <mi> a </mi> <mo> + </mo> <mi> b </mi> <mo> ) </mo> </mrow> <mn> 2 </mn> </msup> </mtd> <mtd> <mo> = </mo> </mtd> <mtd> <msup><mi> c </mi><mn>2</mn></msup> <mo> + </mo> <mn> 4 </mn> <mo> ⋅ </mo> <mo>(</mo> <mfrac> <mn> 1 </mn> <mn> 2 </mn> </mfrac> <mi> a </mi><mi> b </mi> <mo>)</mo>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</mtd> </mtr> <mtr> <mtd> <msup><mi> a </mi><mn>2</mn></msup> <mo> + </mo> <mn> 2 </mn><mi> a </mi><mi> b </mi> <mo> + </mo> <msup><mi> b </mi><mn>2</mn></msup> </mtd> <mtd> <mo> = </mo> </mtd> <mtd> <msup><mi> c </mi><mn>2</mn></msup> <mo> + </mo> <mn> 2 </mn><mi> a </mi><mi> b</mi></mtd></mtr><mtr><mtd></mtd></mtr><mtr><mtd><msup><mi>a </mi><mn>2</mn></msup> <mo> + </mo> <msup><mi> b </mi><mn>2</mn></msup> </mtd> <mtd> <mo> = </mo> </mtd> <mtd> <msup><mi> c </mi><mn>2</mn></msup> </mtd> </mtr> </mtable> </math>',
      feedback: {
        type: 'none',
        value: ''
      }
    },
    {
      value: 'norway',
      label: 'Norway',
      feedback: {
        type: 'none',
        value: ''
      }
    },
    {
      correct: true,
      value: 'finland',
      label: 'Finland',
      feedback: {
        type: 'none',
        value: ''
      }
    }
  ],
  partialScoring: false,
  shuffle: false,
  partialScoringLabel: `Each correct response that is correctly checked and each incorrect response
          that is correctly unchecked will be worth 1 point.
          The maximum points is the total number of answer choices.`
};

const MC_with_math_model = {
  id: "1",
  element: "pie-multiple-choice",
  prompt: `<math> <mrow>
               <msup>
                 <mfenced>
                   <mrow>
                     <mi>a</mi>
                     <mo>+</mo>
                     <mi>b</mi>
                   </mrow>
                 </mfenced>
                 <mn>2</mn>
               </msup>
             </mrow></math>`,
  choiceMode: "checkbox",
  keyMode: "numbers",
  choices: [
    {
      correct: true,
      value: "sweden",
      label: "Sweden",
      feedback: {
        type: "none",
        value: ""
      }
    },
    {
      value: "iceland",
      label: `Iceland <math xmlns="http://www.w3.org/1998/Math/MathML">   <mrow>
                   <msup>
                     <mfenced>
                       <mrow>
                         <mi>a</mi>
                         <mo>+</mo>
                         <mi>b</mi>
                       </mrow>
                     </mfenced>
                     <mn>2</mn>
                   </msup>
                 </mrow> </math>`,
      //label: `Iceland <math style="display: block;"> <mtable columnalign="right center left"> <mtr> <mtd> <msup> <mrow> <mo> ( </mo> <mi> a </mi> <mo> + </mo> <mi> b </mi> <mo> ) </mo> </mrow> <mn> 2 </mn> </msup> </mtd> <mtd> <mo> = </mo> </mtd> <mtd> <msup><mi> c </mi><mn>2</mn></msup> <mo> + </mo> <mn> 4 </mn> <mo> ⋅ </mo> <mo>(</mo> <mfrac> <mn> 1 </mn> <mn> 2 </mn> </mfrac> <mi> a </mi><mi> b </mi> <mo>)</mo>&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</mtd> </mtr> <mtr> <mtd> <msup><mi> a </mi><mn>2</mn></msup> <mo> + </mo> <mn> 2 </mn><mi> a </mi><mi> b </mi> <mo> + </mo> <msup><mi> b </mi><mn>2</mn></msup> </mtd> <mtd> <mo> = </mo> </mtd> <mtd> <msup><mi> c </mi><mn>2</mn></msup> <mo> + </mo> <mn> 2 </mn><mi> a </mi><mi> b</mi></mtd></mtr><mtr><mtd></mtd></mtr><mtr><mtd><msup><mi>a </mi><mn>2</mn></msup> <mo> + </mo> <msup><mi> b </mi><mn>2</mn></msup> </mtd> <mtd> <mo> = </mo> </mtd> <mtd> <msup><mi> c </mi><mn>2</mn></msup> </mtd> </mtr> </mtable> </math>`,
      feedback: {
        type: "none",
        value: ""
      }
    },
    {
      value: "norway",
      label: "Norway",
      feedback: {
        type: "none",
        value: ""
      }
    },
    {
      correct: true,
      value: "finland",
      label: "Finland",
      feedback: {
        type: "none",
        value: ""
      }
    }
  ],
  partialScoring: false,
  partialScoringLabel: `Each correct response that is correctly checked and each incorrect response
            that is correctly unchecked will be worth 1 point.
            The maximum points is the total number of answer choices.`
};

const SelectText_model = {
  tokens: [
    {
      text: "Are you using your time wisely to plan your project",
      start: 16,
      end: 67
    },
    {
      text: "Lucy looked a little confused at first",
      start: 102,
      end: 140
    },
    {
      text:
        "Then she grinned and proudly stated, &#8220;Why, yes I am",
      start: 142,
      end: 199
    },
    {
      text:
        "I plan to make a bird feeder for that tree out our window",
      start: 201,
      end: 258
    }
  ],
  prompt:
    '<p>Select the sentence that <span class="relative-emphasis">BEST</span> explains that the teacher wants to know if Lucy is making good use of her time.</p>',
  text:
    "<p>“Lucy? Are you using your time wisely to plan your project?” Mr. Wilson asked.</p>\n\n<p>Lucy looked a little confused at first. Then she grinned and proudly stated, “Why, yes I am! I plan to make a bird feeder for that tree out our window!”</p>\n",
  disabled: false,
  maxSelections: 1,
  rationale: null,
  teacherInstructions: null,
  element: "select-text",
  id: "8a8080815af1cb83015af728397a04a6"
};

const SelectText_with_correctness_model =         {
  tokens: [
    {
      text: "Are you using your time wisely to plan your project",
      start: 16,
      correct: true,
      end: 67
    },
    {
      text: "Lucy looked a little confused at first",
      start: 102,
      correct: false,
      end: 140
    },
    {
      text:
        "Then she grinned and proudly stated, &#8220;Why, yes I am",
      start: 142,
      correct: false,
      end: 199
    },
    {
      end: 258,
      text:
        "I plan to make a bird feeder for that tree out our window",
      start: 201,
      correct: false
    }
  ],
  prompt:
    '<p>Select the sentence that <span class="relative-emphasis">BEST</span> explains that the teacher wants to know if Lucy is making good use of her time.</p>',
  text:
    "<p>“Lucy? Are you using your time wisely to plan your project?” Mr. Wilson asked.</p>\n\n<p>Lucy looked a little confused at first. Then she grinned and proudly stated, “Why, yes I am! I plan to make a bird feeder for that tree out our window!”</p>\n",
  disabled: true,
  maxSelections: 1,
  correctness: "incorrect",
  feedback: "Incorrect",
  incorrect: true,
  rationale: null,
  teacherInstructions: null,
  element: "select-text",
  id: "8a8080815af1cb83015af728397a04a6"
};

const Passage_model = {
  id: "4028e4a24118948301411e5ec1f11701",
  passages: [
    {
      text:
        '<h3>Being a Bird</h3><div><div class="p-number">1</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Lucy liked her third-grade teacher, Mr. Wilson. However, sometimes he gave some difficult homework. This week he told each student to come up with an interesting project to make and share with the group. He barely gave any directions.</p></div><div class="p-number">2</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Lucy was puzzled. “What is the project about?” she thought. “How should I do it? What should I use?”</p></div><div class="p-number">3</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Mr. Wilson just said, “Find something you want to make, and make it.” Lucy thought that wasn’t very helpful.</p></div><div class="p-number">4</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Next it was free time in class to read and think of project ideas. Lucy sat in her seat and looked out the classroom window. She saw a bright blue bird chirping in the tree. She wondered if the bird ever had to worry about doing a silly project. Lucy got lost in her thoughts. She thought about being that blue bird and flying high in the sky. She wondered what blue birds eat. It must be hard to find food on such a cool autumn day. She imagined being a bird, flying around, looking for food, and finding only broken twigs and dried–up leaves.</p></div><div class="numbered-paragraph"><p style="text-align: center;"><span class="no-number"><img alt="image ad17ebdad1c54adcb7d6e3132d070cac" id="ad17ebdad1c54adcb7d6e3132d070cac" src="https://storage.googleapis.com/pie-staging-221718-assets/image/ae43a89d-363e-4d89-873e-899ef680d4e4"></span></p></div><div class="p-number">5</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;“Lucy? Are you using your time wisely to plan your project?” Mr. Wilson asked.</p></div><div class="p-number">6</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Lucy looked a little confused at first. Then she grinned and proudly stated, “Why, yes I am! I plan to make a bird feeder for that tree out our window!”</p></div><div class="p-number">7</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Mr. Wilson smiled. “I think that will be an excellent project, Lucy,” he said.</p></div></div>',
      title: "Being a Bird"
    },
    {
      title: "A Giant Flower",
      text:
        '<h3>A Giant Flower</h3><div><div class="p-number">1</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;After school, Lucy’s mother reminded her, “Time to do your science reading for Mr. Wilson’s class.”</p></div><div class="p-number">2</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Lucy was not excited about the subject. She pulled out her book and flipped to the page about plant parts. She read about the leaves, the stems, and the roots. She realized how simple yet useful each part was.</p></div><div class="p-number">3</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Lucy glanced up from her book and saw a small bug climbing the window of her room. “What would it be like to be as tiny as a bug and see a plant?” she thought to herself. “I am so big that plants seem small and boring. But what if I were as tiny as a little insect?”</p></div><div class="numbered-paragraph"><p style="text-align: center;"><span class="no-number"><img alt="image 38c9a851974945af9defc96509a85e62" id="38c9a851974945af9defc96509a85e62" src="https://storage.googleapis.com/pie-staging-221718-assets/image/c691a6b7-992d-4b12-92dd-1c0d95f47775"></span></p></div><div class="p-number">4</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;Lucy imagined herself as a bug walking up to a simple flower out in the garden. It would tower over her. The colorful petals would stretch overhead and shade her like a large umbrella. She would crawl over the thick roots, inch up the giant stem, and try to find a comfortable place to rest on a flat, broad leaf.</p></div><div class="numbered-paragraph"><p style="text-align: center;"><span class="no-number"><img alt="image 6845ae1df2734622b6dd8adb35e7f84e" id="6845ae1df2734622b6dd8adb35e7f84e" src="https://storage.googleapis.com/pie-staging-221718-assets/image/225b8019-2109-49d7-b63f-e77d6a88b2f0"></span></p></div><div class="p-number">5</div><div class="numbered-paragraph"><p>&nbsp; &nbsp; &nbsp;“Lucy! Dinner!” Her mother’s shout woke her out of her daydream. The bug was now gone, but somehow the plant picture in her book looked quite a bit more interesting. Lucy raced down to dinner. She wanted to hurry back to finish the chapter.</p></div></div>'
    }
  ],
  element: "pie-passage"
};
