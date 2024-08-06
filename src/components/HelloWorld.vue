<template>
  <div class="w-75 mx-auto p-5" id="container" style="background-color: antiquewhite; border-radius: 5%;">
    <h1>{{ msg }}</h1>
    <div class="fw-bold mt-3 p-2 w-25" style="background-color: black; color: yellow; border-radius: 100%;">
      Chọn video để cắt
    </div>
    <div class="mt-3 w-25">
      <input class="form-control" type="file" id="formFile" @change="onFileChange" />
    </div>
    <div class="fw-bold mt-4 p-2 w-25" style="background-color: black; color: yellow; border-radius: 100%;">
      Cắt video thành nhiều đoạn nhỏ
    </div>
    <div class="mt-3 single-line">
      Cắt thành nhiều video có độ dài
      <input class="form-control line ipSecond" type="text" placeholder="Nhập giây" v-model.number="cutDuration"
        aria-label="default input example" />
      giây và bỏ qua
      <input class="form-control line ipSecond" type="text" placeholder="Nhập giây" v-model.number="skipDuration"
        aria-label="default input example" />
      giây
      <button type="button" class="btn btn-primary ms-5 button-85" @click="cutVideo">
        Cắt
      </button>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export default {
  data() {
    return {
      msg: "CAPCUT SHOPEE",
      cutDuration: null,
      skipDuration: null,
      videoFile: null,
      videoDuration: 0,
    };
  },
  methods: {
    async onFileChange(event) {
      this.videoFile = event.target.files[0];
      this.getVideoDuration(this.videoFile);
    },
    getVideoDuration(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const media = new Audio(event.target.result);
        media.onloadedmetadata = () => {
          this.videoDuration = media.duration;
        };
      };
      reader.readAsDataURL(file);
    },
    async cutVideo() {
      if (!this.videoFile || !this.cutDuration || !this.skipDuration) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Vui lòng chọn video và nhập thời gian cắt, bỏ qua!",
        });
        return;
      }

      const ffmpeg = createFFmpeg({ log: true });
      await ffmpeg.load();

      ffmpeg.FS("writeFile", "input.mp4", await fetchFile(this.videoFile));

      const duration = this.cutDuration;
      const skip = this.skipDuration;
      let startTime = 0;
      let part = 1;
      let isCutting = true;

      while (isCutting) {
        const outputFile = `output_part_${part}.mp4`;
        try {
          await ffmpeg.run(
            "-i",
            "input.mp4",
            "-ss",
            startTime.toString(),
            "-t",
            duration.toString(),
            "-c",
            "copy",
            outputFile
          );

          const data = ffmpeg.FS("readFile", outputFile);
          const url = URL.createObjectURL(
            new Blob([data.buffer], { type: "video/mp4" })
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = `part_${part}.mp4`;
          a.click();

          startTime += duration + skip;
          part++;

          if (startTime >= this.videoDuration) {
            isCutting = false;
          }
        } catch (e) {
          console.log("Cắt video hoàn thành hoặc xảy ra lỗi:", e);
          isCutting = false;
        }
      }
    },
  },
};
</script>

<style scoped>
#container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.d-flex {
  display: flex;
}

.justify-content-center {
  justify-content: center;
}

.w-50 {
  width: 50%;
}

.line {
  display: inline-block;
  width: auto;
  margin: 0 5px;
}

.ipSecond {
  width: 15%;
}
/* CSS */
.button-85 {
  width: 10%;
  padding: 0.6em 2em;
  border: none;
  outline: none;
  color: rgb(255, 255, 255);
  background: #111;
  cursor: pointer;
  position: relative;
  z-index: 0;
  border-radius: 10px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-85:before {
  content: "";
  background: linear-gradient(
    45deg,
    #ff0000,
    #ff7300,
    #fffb00,
    #48ff00,
    #00ffd5,
    #002bff,
    #7a00ff,
    #ff00c8,
    #ff0000
  );
  position: absolute;
  top: -2px;
  left: -2px;
  background-size: 400%;
  z-index: -1;
  filter: blur(5px);
  -webkit-filter: blur(5px);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  animation: glowing-button-85 20s linear infinite;
  transition: opacity 0.3s ease-in-out;
  border-radius: 10px;
}

@keyframes glowing-button-85 {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

.button-85:after {
  z-index: -1;
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #222;
  left: 0;
  top: 0;
  border-radius: 10px;
}
</style>
