const theme = {
  player: `
    background-color: rgb(30, 30, 36, 0.25);
    border-top-color: rgb(51 65 85);
    border-top-width: 0.1px;
    width: 100%;
    backdrop-filter: blur(4px);
  `,
  playerContainer: `
    display: grid;
    grid-template-columns: 33% 33% 33%;
  `,
  playerArtContainer: `
    margin-right: auto;
    display: flex;
    max-width: 500px;

    @media (max-width: 768px) {
      min-width: 200px;
      width: 200px;
      max-width: 200px;
      padding-left: 75px;
    }
  `,
  playerTextContainer: () => css`
    @media (max-width: 768px) {
      width: 150px !important;
    }
  `,
  playerControlContainer: `
    display: flex;
  `,
  playIcon: `
    fill: none;
    :hover {
      fill: none;
    }
  `,
  playerText: `
    color: #ffffff;
    :hover {
      color: #ffffff;
    }
    font-size: 22px;
    margin-top: 8px;

    @media (max-width: 768px) {
      font-size: 16px;
      margin-top: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
      min-width: 100px;
    }
  `,
  playerTextArtist: `
    font-size: 14px;
    color: #e5e5e5;

    @media (max-width: 768px) {
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
      min-width: 100px;
    }
    :hover {
      color: #e5e5e5;
    }
  `,
  playerTextContainer: `
    @media (max-width: 768px) {
      padding: 12px 0 12px 0;
    }
  `,
  playerImage: `
    border-radius: 10px;
    :hover {
      opacity: 1.0;
    }
    width: 100px;
    height: 100px;

    @media (max-width: 768px) {
      width: 60px;
      height: 60px;
    }
  `,
  playerSpinner: `
    position: absolute;
    top: -15px;
    left: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    ::after {
      content: none;
    }

    animation-name: none;

    @media (max-width: 768px) {
      top: 20px;
      left: 10px;
    }
  `,
  playerInfoNextTag: `
    font-size: 12px;
    min-width: 100px;
    color: #e5e5e5;
    text-transform: uppercase;
    font-weight: lighter;
  `,
  playerInfoContainer: `
    align-items: right;
    justify-content: right;
    margin-left: auto;
    position: relative;
    width: min(100vw, 300px);

    @media (max-width: 768px) {
      margin-bottom: 0;
      width: min(100vw, 150px);
    }
  `,
  playerInfoNextText: `
    max-width: 250px;
    display: block;

    @media (max-width: 768px) {
      font-size: 14px;
    }
  `,
};

export default theme;
