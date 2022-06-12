export const dummyAvatarBase64 = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzE0MWYzODt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPnVzZXItb3V0bGluZTwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzIwLDMxMC4xOFYyNzcuMjdBMTI4LDEyOCwwLDAsMCwzODQsMTY2LjRWMTI4YTEyOCwxMjgsMCwwLDAtMjU2LDB2MzguNGExMjgsMTI4LDAsMCwwLDY0LDExMC44N3YzMi45MUExNzIuODQsMTcyLjg0LDAsMCwwLDUxLjIsNDgwYTMyLDMyLDAsMCwwLDMyLDMySDQyOC44YTMyLDMyLDAsMCwwLDMyLTMyQTE3Mi44NCwxNzIuODQsMCwwLDAsMzIwLDMxMC4xOFpNMTUzLjYsMTY2LjRWMTI4YTEwMi40LDEwMi40LDAsMSwxLDIwNC44LDB2MzguNGExMDIuNCwxMDIuNCwwLDEsMS0yMDQuOCwwWk0yNTYsMjk0LjRhMTI3Ljk0LDEyNy45NCwwLDAsMCwzOC40LTUuODZ2MjkuNzdsLTM4LjQsMjMtMzguNC0yM1YyODguNTRBMTI3Ljk0LDEyNy45NCwwLDAsMCwyNTYsMjk0LjRabTE3Mi44LDE5Mkg4My4yYTYuNDEsNi40MSwwLDAsMS02LjQtNi40YzAtNzEuNzIsNTEuNTYtMTMxLjYxLDExOS41Ni0xNDQuNThMMjU2LDM3MS4ybDU5LjY0LTM1Ljc4YzY4LDEzLDExOS41Niw3Mi44NiwxMTkuNTYsMTQ0LjU4QTYuNDEsNi40MSwwLDAsMSw0MjguOCw0ODYuNFoiLz48L3N2Zz4=';

export function replaceOnError(elem: HTMLElement | null | undefined) {
    if (elem) {
        elem.addEventListener('error', (e) => {
            if (e.target) {
                (e.target as HTMLImageElement).src = dummyAvatarBase64;
            }
        });
    }
}

export default { dummyAvatarBase64, replaceOnError };
