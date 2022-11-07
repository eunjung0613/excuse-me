import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { TriangleDownIcon } from '@chakra-ui/icons';
import { GetServerSideProps, NextPage } from 'next';
import ResizeTextarea from 'react-textarea-autosize';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { ServiceLayout } from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  screenName: string;
}
async function postMessage({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  }; // 익명인지 아닌지 판단
}) {
  if (message.length < 0) {
    return {
      result: false,
      message: '메시지를 입력해주세요',
    };
  }
  try {
    await fetch('/api/messages.add', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        message,
        author,
      }),
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '저장실패',
    };
  }
}

const userHomePage: NextPage<Props> = function ({ userInfo, screenName }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setAnonymous] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [messageList, setMessageList] = useState<InMessage[]>([]);
  const toast = useToast();
  const { authUser } = useAuth();
  const [messageListFetchTrigger, setMessageListFetchTrigger] = useState(false);

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
      if (resp.status === 200) {
        const data: InMessage = await resp.json();
        setMessageList((prev) => {
          const findIndex = prev.findIndex((fv) => fv.id === data.id);
          if (findIndex >= 0) {
            const updateArr = [...prev];
            updateArr[findIndex] = data;
            return updateArr;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  const messageListQueryLey = ['messageList', userInfo?.uid, page, messageListFetchTrigger];
  useQuery(
    messageListQueryLey,
    async () =>
      // eslint-disable-next-line no-return-await
      await axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        content: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setTotalPages(data.data.totalPages);
        if (page === 1) {
          setMessageList([...data.data.content]);
          return;
        }
        setMessageList((prev) => [...prev, ...data.data.content]);
      },
    },
  );

  if (userInfo === null) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }
  const isOwner = authUser !== null && authUser.uid === userInfo.uid;
  return (
    <ServiceLayout title={`${userInfo.displayName}의 Home`} minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL ?? 'https://i.ibb.co/px4zSdP/pngwing-com.png'} mr="2" />
            <Flex direction="column" justify="center">
              <Text fontSize="md">{userInfo.displayName}</Text>
              <Text fontSize="xs">{userInfo.email}</Text>
            </Flex>
          </Flex>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white" p="2">
          <Flex align="center">
            <Avatar
              size="xs"
              src={
                isAnonymous
                  ? 'https://i.ibb.co/px4zSdP/pngwing-com.png'
                  : authUser?.photoURL ?? 'https://i.ibb.co/px4zSdP/pngwing-com.png'
              }
              mr="2"
            />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="무엇이 궁금한가요?"
              resize="none"
              minH="unset"
              overflow="hidden"
              fontSize="xs"
              mr="2"
              as={ResizeTextarea}
              maxRows={7}
              value={message}
              onChange={(e) => {
                if (e.currentTarget.value) {
                  const lineCount = e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
                  if (lineCount >= 7) {
                    toast({ title: '최대 7줄까지만 입력 가능합니다.', position: 'top-right' });
                    return;
                  }
                }
                setMessage(e.currentTarget.value);
              }}
            />
            <Button
              bgColor="#FFB86C"
              color="white"
              colorScheme="yellow"
              variant="solid"
              size="sm"
              onClick={async () => {
                const postData: {
                  message: string;
                  uid: string;
                  author?: {
                    displayName: string;
                    photoURL?: string;
                  };
                } = {
                  message,
                  uid: userInfo.uid,
                };
                if (isAnonymous === false) {
                  postData.author = {
                    photoURL: authUser?.photoURL ?? 'https://i.ibb.co/px4zSdP/pngwing-com.png',
                    displayName: authUser?.displayName ?? 'ananymous',
                  };
                }
                const messageResp = await postMessage(postData);
                if (messageResp.result === false) {
                  toast({ title: '메세지 등록 실패', position: 'top-right' });
                }
                setMessage('');
                setPage(1);
                setTimeout(() => {
                  setMessageListFetchTrigger((perv) => !perv);
                }, 50);
              }}
              disabled={message.length === 0}
            >
              등록
            </Button>
          </Flex>
          <FormControl display="flex" alignItems="center" mt="2" pb="2">
            <Switch
              size="sm"
              colorScheme="orange"
              id="anonymous"
              mr="1"
              isChecked={isAnonymous}
              onChange={() => {
                if (authUser === null) {
                  toast({ title: '로그인이 필요합니다.', position: 'top-right' });
                  return;
                }
                setAnonymous((prev) => !prev);
              }}
            />
            <FormLabel htmlFor="anonymous" mb="0" fontSize="xx-small">
              anonymous
            </FormLabel>
          </FormControl>
        </Box>
        <VStack spacing="12px" mt="6">
          {messageList.map((messageData) => (
            <MessageItem
              key={`message-Item-${userInfo.uid}-${messageData.id}`}
              item={messageData}
              uid={userInfo.uid}
              screenName={screenName}
              displayName={userInfo.displayName ?? 'https://i.ibb.co/px4zSdP/pngwing-com.png'}
              photoURL={userInfo.photoURL ?? 'https://i.ibb.co/px4zSdP/pngwing-com.png'}
              isOwner={isOwner}
              onSendComplete={() => {
                fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
              }}
            />
          ))}
        </VStack>
        {totalPages > page && (
          <Button
            width="full"
            mt="2"
            fontSize="sm"
            leftIcon={<TriangleDownIcon />}
            onClick={() => {
              setPage((p) => p + 1);
            }}
          >
            더보기
          </Button>
        )}
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName } = query;
  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }
  const screenNameToStr = Array.isArray(screenName) ? screenName[0] : screenName;
  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    return {
      props: {
        userInfo: userInfoResp.data ?? null,
        screenName: screenNameToStr,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }
};

export default userHomePage;
