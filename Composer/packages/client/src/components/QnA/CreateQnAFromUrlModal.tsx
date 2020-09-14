// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps } from '@reach/router';
import { QnAFile } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { FieldConfig, useForm } from '../../hooks/useForm';

import { knowledgeBaseSourceUrl, QnAMakerLearningUrl, validateUrl, validateName } from './constants';
import { subText, styles, dialogWindow, textField, warning } from './styles';

interface CreateQnAFromUrlModalProps
  extends RouteComponentProps<{
    location: string;
  }> {
  dialogId: string;
  qnaFiles: QnAFile[];
  subscriptionKey?: string;
  onDismiss: () => void;
  onSubmit: (formData: CreateQnAFromUrlFormData) => void;
}

export interface CreateQnAFromUrlFormData {
  url: string;
  name: string;
  multiTurn: boolean;
}

const formConfig: FieldConfig<CreateQnAFromUrlFormData> = {
  url: {
    required: true,
    defaultValue: '',
  },
  name: {
    required: true,
    defaultValue: '',
  },
  multiTurn: {
    required: false,
    defaultValue: false,
  },
};

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Create new knowledge base')}
      <p>
        <span css={subText}>
          {formatMessage(
            'Extract question-and-answer pairs from an online FAQ, product manuals, or other files. Supported formats are .tsv, .pdf, .doc, .docx, .xlsx, containing questions and answers in sequence. '
          )}
          <Link href={knowledgeBaseSourceUrl} target={'_blank'}>
            {formatMessage('Learn more about knowledge base sources. ')}
          </Link>
          {formatMessage(
            'Skip this step to add questions and answers manually after creation. The number of sources and file size you can add depends on the QnA service SKU you choose. '
          )}
          <Link href={QnAMakerLearningUrl} target={'_blank'}>
            {formatMessage('Learn more about QnA Maker SKUs.')}
          </Link>
        </span>
      </p>
    </div>
  );
};

export const CreateQnAFromUrlModal: React.FC<CreateQnAFromUrlModalProps> = (props) => {
  const { onDismiss, onSubmit, dialogId, qnaFiles } = props;

  formConfig.name.validate = validateName(qnaFiles);
  formConfig.url.validate = validateUrl;
  const { formData, updateField, hasErrors, formErrors } = useForm(formConfig);
  const isQnAFileselected = !(dialogId === 'all');
  const disabled = hasErrors;

  const updateName = (name = '') => {
    updateField('name', name);
  };
  const updateMultiTurn = (val) => {
    updateField('multiTurn', val);
  };
  const updateUrl = (url = '') => {
    updateField('url', url);
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: <DialogTitle />,
        styles: styles.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={onDismiss}
    >
      <div css={dialogWindow}>
        <Stack>
          <TextField
            data-testid={`knowledgeLocationTextField-name`}
            errorMessage={formErrors.name}
            label={formatMessage('Knowledge base name')}
            placeholder={formatMessage('Type a name that describes this content')}
            styles={textField}
            value={formData.name}
            onChange={(e, name) => updateName(name)}
          />
        </Stack>
        <Stack>
          <TextField
            data-testid={`knowledgeLocationTextField-url`}
            errorMessage={formErrors.url}
            label={formatMessage('Knowledge source')}
            placeholder={formatMessage('Enter a URL or browse to upload a file ')}
            styles={textField}
            value={formData.url}
            onChange={(e, url) => updateUrl(url)}
          />

          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('Please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
        <Stack>
          <Checkbox
            label={formatMessage('Enable multi-turn extraction')}
            onChange={(_e, val) => updateMultiTurn(val)}
          />
        </Stack>
      </div>
      <DialogFooter>
        {window.location.href.indexOf('/knowledge-base/') == -1 && (
          <DefaultButton
            data-testid={'createKnowledgeBaseFromScratch'}
            styles={{ root: { float: 'left' } }}
            text={formatMessage('Create knowledge base from scratch')}
            onClick={() => {
              if (hasErrors) {
                return;
              }
              onSubmit({} as CreateQnAFromUrlFormData);
            }}
          />
        )}
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create KB')}
          onClick={() => {
            if (hasErrors) {
              return;
            }
            onSubmit(formData);
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAFromUrlModal;