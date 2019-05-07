

      const config = {
        id: '1',
        elements: {
          'pie-multiple-choice': '@pie-element/multiple-choice@2.7.3'
        },
        models: [
          {
            id: '1',
            element: 'pie-multiple-choice',
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
                label: 'Iceland',
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
            partialScoringLabel: `Each correct response that is correctly checked and each incorrect response
            that is correctly unchecked will be worth 1 point.
            The maximum points is the total number of answer choices.`
          }
          
        ],
        markup: `<pie-multiple-choice id='1'></pie-multiple-choice> `
      };

      const passaageConfig = {
        id: '1',
        elements: {
          'pie-passage': '@pie-element/passage@1.1.0'
        },
        models: [
          {
            id: '1',
            element: 'pie-passage',
            title: 'Ineskeen Road, July Evening',
            content: `The bicycles go by in twos and threes -<br/> 
            There's a dance in Billy Brennan's barn tonight,<br/>
            And there's the half-talk code of mysteries<br/>
            And the wink-and-elbow language of delight.<br/>
            Half-past eight and there is not a spot<br/>
            Upon a mile of road, no shadow thrown<br/>
            That might turn out a man or woman, not<br/>
            A footfall tapping secrecies of stone. <br/>
            <p/>
            I have what every poet hates in spite<br/>
            Of all the solemn talk of contemplation.<br/>
            Oh, Alexander Selkirk knew the plight<br/>
            Of being king and government and nation.<br/>
            A road, a mile of kingdom. I am king<br/>
            Of banks and stones and every blooming thing.<br/>
            `
        }
        ],
        markup: `<pie-passage id='1'></pie-passage> `
      }


      const stimulusPlayer = document.getElementById('stimulusPlayer');


      stimulusPlayer.addEventListener('sessionChanged', event => {
        console.log(event.type + ':' + JSON.stringify(event.detail));
      });

      stimulusPlayer.config = passaageConfig;

      const itemPlayer = document.getElementById('itemPlayer');
      itemPlayer.config = config;
  