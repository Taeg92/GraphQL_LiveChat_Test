import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { gql } from "apollo-boost";
import { useMutation } from "react-apollo-hooks";

const ENTER_ROOM = gql`
  mutation enterRoom(
    $nickname: String!
    $avatar: String!
    $lang: String!
    $code: String!
  ) {
    enterRoom(nickname: $nickname, avatar: $avatar, lang: $lang, code: $code) {
      userId
      roomId
    }
  }
`;
const CREATE_ROOM = gql`
  mutation createRoom($nickname: String!, $avatar: String!, $lang: String!) {
    createRoom(nickname: $nickname, avatar: $avatar, lang: $lang) {
      userId
      roomId
      code
    }
  }
`;
const Home = () => {
  const history = useHistory();
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState(0);
  const [avatar, setAvatar] = useState("https://picsum.photos/200");
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("");
  const [enterRoomMutation] = useMutation(ENTER_ROOM, {
    variables: {
      nickname,
      avatar,
      lang,
      code,
    },
  });
  const [createRoomMutation] = useMutation(CREATE_ROOM, {
    variables: {
      nickname,
      avatar,
      lang,
    },
  });
  const handleNickname = (e) => {
    setNickname(e.target.value);
  };

  const handleEnterClick = async () => {
    const roomCode = prompt("Room Code");
    setCode(roomCode);
  };

  const handleCreateClick = async () => {
    const { data } = await createRoomMutation();
    history.push({
      pathname: `/room/${data.createRoom.roomId}`,
      state: {
        userId: data.createRoom.userId,
        code: data.createRoom.code,
        nickname,
        avatar,
        lang,
        isUnsubscribe: false,
      },
    });
  };

  const onChangeLang = (event) => {
    const {
      target: { value },
    } = event;
    setLang(value);
  };

  const enterRoomFunction = async () => {
    const { data } = await enterRoomMutation();
    history.push({
      pathname: `/room/${data.enterRoom.roomId}`,
      state: { userId: data.enterRoom.userId, code, nickname, avatar, lang },
    });
  };

  useEffect(() => {
    if (!code) return;
    console.log(nickname, avatar, lang);
    enterRoomFunction();
    return () => {
      setCode("");
    };
  }, [code]);

  return (
    <>
      <h1>Welcome Home</h1>
      <input placeholder="닉네임 입력" onChange={handleNickname} />
      <select name="language" id="language-select" onChange={onChangeLang}>
        <option value="">언어 선택</option>
        <option value="ko">ko</option>
        <option value="en">en</option>
        <option value="ja">ja</option>
      </select>
      <button onClick={handleEnterClick}>대화 참여하기</button>
      <button onClick={handleCreateClick}>방 만들기</button>
    </>
  );
};
export default Home;
