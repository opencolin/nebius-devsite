// Gravity UI's <TextArea> doesn't accept a `label` prop the way <TextInput>
// does, so wrap it with a label of our own. Mirrors Gravity's own label
// styling (caption-2, secondary color) so labeled fields look consistent
// across forms.

import {Text, TextArea, type TextAreaProps} from '@gravity-ui/uikit';

interface Props extends Omit<TextAreaProps, 'label'> {
  label: string;
}

export function LabeledTextArea({label, ...rest}: Props) {
  return (
    <label style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <Text variant="body-2" color="secondary">
        {label}
      </Text>
      <TextArea {...rest} />
    </label>
  );
}
