import React, { useState, useEffect, useCallback } from "react";
import {
  Ruler,
  Train,
  Move,
  RotateCcw,
  Check,
  Info,
  GraduationCap,
  ArrowRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";

// --- Các thành phần UI cơ bản ---
const Button = ({
  onClick,
  children,
  className = "",
  disabled = false,
  active = false,
  variant = "default",
}) => {
  const baseStyle =
    "px-4 py-2 rounded-lg font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2";

  const variants = {
    default: active
      ? "bg-blue-600 text-white shadow-inner"
      : "bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 shadow-sm",
    success: "bg-green-500 text-white hover:bg-green-600 shadow-md",
    outline: "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50",
    danger: "bg-red-100 text-red-600 border-2 border-red-200",
  };

  const style = variants[variant] || variants.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${style} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}
  >
    {children}
  </div>
);

// --- Ứng dụng chính ---
export default function GeometryCity() {
  const [mode, setMode] = useState("parallel"); // 'parallel' | 'perpendicular' | 'practice'

  // State cho chế độ khám phá
  const [angle, setAngle] = useState(15);
  const [showProtractor, setShowProtractor] = useState(false);
  const [message, setMessage] = useState({
    text: "Hãy điều chỉnh đường thẳng nhé!",
    type: "info",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // State cho chế độ luyện tập (Quiz)
  const [quizState, setQuizState] = useState({
    questionType: "parallel", // 'parallel' | 'perpendicular' | 'intersecting'
    displayAngle: 0,
    theme: "rail", // 'rail' | 'road'
    answered: false,
    isCorrect: false,
    score: 0,
    total: 0,
  });

  // --- Logic Chế độ Khám Phá ---
  useEffect(() => {
    if (mode !== "practice") {
      setAngle(mode === "parallel" ? 15 : 75);
      setIsSuccess(false);
      setMessage({
        text: "Kéo thanh trượt hoặc bấm nút để điều chỉnh góc.",
        type: "info",
      });
      setShowProtractor(false);
    } else {
      generateNewQuestion();
    }
  }, [mode]);

  const checkResult = () => {
    if (mode === "parallel") {
      if (Math.abs(angle) < 2) {
        setIsSuccess(true);
        setMessage({
          text: "Tuyệt vời! Hai đường ray đã song song. Tàu chạy an toàn!",
          type: "success",
        });
      } else {
        setIsSuccess(false);
        setMessage({
          text: "Ôi không! Hai đường ray sẽ cắt nhau mất. Hãy chỉnh lại cho thẳng hàng (0 độ).",
          type: "error",
        });
      }
    } else if (mode === "perpendicular") {
      if (Math.abs(angle - 90) < 2) {
        setIsSuccess(true);
        setMessage({
          text: "Chính xác! Hai con đường đã tạo thành góc vuông 90 độ.",
          type: "success",
        });
      } else {
        setIsSuccess(false);
        setMessage({
          text: "Chưa vuông góc đâu. Hãy dùng Ê-ke để kiểm tra nhé!",
          type: "error",
        });
      }
    }
  };

  const handleSliderChange = (e) => {
    setAngle(parseInt(e.target.value));
    setIsSuccess(false);
    setMessage({ text: "Đang điều chỉnh...", type: "info" });
  };

  // --- Logic Chế độ Luyện Tập ---
  const generateNewQuestion = () => {
    const types = ["parallel", "perpendicular", "intersecting"];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const themes = ["rail", "road"];
    const selectedTheme = themes[Math.floor(Math.random() * themes.length)];

    let qAngle = 0;
    if (selectedType === "parallel") {
      qAngle = 0;
    } else if (selectedType === "perpendicular") {
      qAngle = 90;
    } else {
      // Góc ngẫu nhiên nhưng tránh 0 và 90 (và các góc gần đó)
      do {
        qAngle = Math.floor(Math.random() * 160) - 80; // -80 to 80
      } while (
        Math.abs(qAngle) < 10 ||
        Math.abs(qAngle - 90) < 10 ||
        Math.abs(qAngle + 90) < 10
      );
    }

    // Nếu theme là road (vuông góc chuẩn là 90 độ so với trục ngang), rail là song song (0 độ so với trục ngang)
    // Để làm khó hơn, ta có thể xoay cả hệ trục, nhưng giữ đơn giản trước.
    // Với logic hiện tại:
    // Rail: base line (0 deg), moving line (angle) -> Parallel if angle=0
    // Road: base line (0 deg), moving line (angle - 90 logic cũ) -> Perpendicular if angle=90 relative logic cũ, tức là tạo góc 90 với base.

    // Thống nhất hiển thị cho quiz:
    // Base line luôn nằm ngang.
    // Moving line xoay theo `qAngle`.
    // Nếu Parallel: qAngle = 0.
    // Nếu Perpendicular: qAngle = 90 (hoặc -90).

    setQuizState((prev) => ({
      ...prev,
      questionType: selectedType,
      displayAngle: qAngle,
      theme: selectedTheme,
      answered: false,
      isCorrect: false,
    }));
  };

  const handleAnswer = (answerType) => {
    if (quizState.answered) return;

    const isCorrect = answerType === quizState.questionType;
    setQuizState((prev) => ({
      ...prev,
      answered: true,
      isCorrect: isCorrect,
      score: isCorrect ? prev.score + 10 : prev.score,
      total: prev.total + 10,
    }));
  };

  // Render SVG Content dựa trên Mode
  const renderCanvasContent = () => {
    // Xác định thông số dựa trên mode hiện tại
    const isPractice = mode === "practice";
    const currentTheme = isPractice
      ? quizState.theme
      : mode === "parallel"
      ? "rail"
      : "road";
    // Trong practice, góc hiển thị trực tiếp. Trong mode thường, góc tính toán dựa trên logic cũ.
    // Logic cũ: Parallel mode (0 là song song), Perpendicular mode (90 là vuông góc - hiển thị rotate angle-90)

    let rotateDeg = 0;
    let baseTranslateY = 0;
    let movingTranslate = "";

    if (isPractice) {
      // Trong quiz, ta đơn giản hóa: 1 đường ngang, 1 đường xoay theo displayAngle
      // Nếu displayAngle = 0 -> Song song
      // Nếu displayAngle = 90 -> Vuông góc
      baseTranslateY = 200;
      movingTranslate = `translate(300, 200) rotate(${quizState.displayAngle})`;
      // Cần chỉnh lại vị trí để nếu song song (0 độ) thì nó không trùng khít lên đường kia mà nằm song song
      if (currentTheme === "rail") {
        // Rail style logic
        baseTranslateY = 150;
        movingTranslate = `translate(50, 270) rotate(${quizState.displayAngle})`;
      } else {
        // Road/Intersect logic (Cross centered)
        baseTranslateY = 200;
        movingTranslate = `translate(300, 200) rotate(${
          quizState.displayAngle - 90
        })`; // -90 để 90 độ thành thẳng đứng
      }
    } else {
      // Logic cũ của interactive mode
      if (mode === "parallel") {
        baseTranslateY = 100;
        movingTranslate = `translate(50, 220) rotate(${angle})`;
      } else {
        baseTranslateY = 200;
        movingTranslate = `translate(300, 200) rotate(${angle - 90})`;
      }
    }

    return (
      <g>
        {/* BASE LINE (Đường cố định) */}
        {currentTheme === "rail" ? (
          <g transform={`translate(0, ${baseTranslateY})`}>
            <line
              x1="0"
              y1="0"
              x2="600"
              y2="0"
              stroke="#374151"
              strokeWidth="8"
            />
            <rect
              x="0"
              y="-10"
              width="600"
              height="20"
              fill="url(#railPattern)"
              opacity="0.5"
            />
          </g>
        ) : (
          <g transform={`translate(0, ${baseTranslateY})`}>
            <rect x="0" y="-20" width="600" height="40" fill="#9ca3af" />
            <line
              x1="0"
              y1="0"
              x2="600"
              y2="0"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="10 10"
            />
          </g>
        )}

        {/* MOVING LINE (Đường thứ 2) */}
        <g transform={movingTranslate}>
          {currentTheme === "rail" ? (
            <g>
              <line
                x1="-50"
                y1="0"
                x2="600"
                y2="0"
                stroke={
                  !isPractice && isSuccess
                    ? "#10b981"
                    : isPractice
                    ? "#ef4444"
                    : "#ef4444"
                }
                strokeWidth="8"
              />
              <rect
                x="-50"
                y="-10"
                width="650"
                height="20"
                fill="url(#railPattern)"
                opacity="0.5"
              />

              {/* Tàu hỏa (Chỉ hiện khi thành công ở mode interactive) */}
              {!isPractice && isSuccess && mode === "parallel" && (
                <g className="animate-slide">
                  <rect
                    x="0"
                    y="-12"
                    width="60"
                    height="24"
                    rx="4"
                    fill="#3b82f6"
                  />
                  <circle cx="10" cy="12" r="4" fill="#1e3a8a" />
                  <circle cx="50" cy="12" r="4" fill="#1e3a8a" />
                  <text x="15" y="5" fill="white" fontSize="10">
                    VN-Express
                  </text>
                </g>
              )}
            </g>
          ) : (
            <g>
              <rect
                x="-20"
                y="-200"
                width="40"
                height="400"
                fill={
                  !isPractice && isSuccess
                    ? "#86efac"
                    : isPractice
                    ? "#fca5a5"
                    : "#fca5a5"
                }
                opacity="0.9"
              />
              <line
                x1="0"
                y1="-200"
                x2="0"
                y2="200"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="10 10"
              />
            </g>
          )}
        </g>

        {/* Ê-ke (Chỉ cho mode Perpendicular Interactive) */}
        {mode === "perpendicular" && showProtractor && (
          <g transform="translate(300, 200)" style={{ pointerEvents: "none" }}>
            <path
              d="M0,0 L0,-150 L100,0 Z"
              fill="rgba(255, 255, 0, 0.5)"
              stroke="orange"
              strokeWidth="2"
            />
            <text x="10" y="-10" fontSize="12" fill="brown">
              90°
            </text>
            <circle cx="0" cy="0" r="4" fill="red" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2 uppercase tracking-wide">
            🏙️ Thành Phố Hình Học 📐
          </h1>
          <p className="text-gray-600">
            Học, Chơi và Thực hành cùng Kiến Trúc Sư Nhí
          </p>
        </header>

        {/* Menu Điều hướng */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6">
          <Button
            active={mode === "parallel"}
            onClick={() => setMode("parallel")}
            className="min-w-[120px]"
          >
            <Train size={20} /> Song Song
          </Button>
          <Button
            active={mode === "perpendicular"}
            onClick={() => setMode("perpendicular")}
            className="min-w-[120px]"
          >
            <Move size={20} /> Vuông Góc
          </Button>
          <Button
            active={mode === "practice"}
            onClick={() => setMode("practice")}
            className="min-w-[120px]"
          >
            <GraduationCap size={20} /> Luyện Tập
          </Button>
        </div>

        {/* Khu vực Canvas */}
        <Card className="relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300">
          {/* Hướng dẫn / Điểm số */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
            <div className="bg-white/90 p-3 rounded shadow text-sm max-w-xs backdrop-blur-sm">
              {mode === "practice" ? (
                <div>
                  <strong className="text-blue-600 block mb-1">
                    CÂU HỎI THỬ THÁCH:
                  </strong>
                  Hai đường thẳng/đối tượng hình bên dưới có mối quan hệ gì?
                </div>
              ) : (
                <div>
                  <strong className="text-blue-600 block mb-1">
                    NHIỆM VỤ:
                  </strong>
                  {mode === "parallel"
                    ? "Chỉnh đường ray dưới SONG SONG với đường trên."
                    : "Chỉnh đường dọc VUÔNG GÓC với đường ngang."}
                </div>
              )}
            </div>

            {mode === "practice" && (
              <div className="bg-yellow-100 border-2 border-yellow-400 p-2 rounded-lg font-bold text-yellow-800 shadow-sm animate-pulse">
                Điểm: {quizState.score}
              </div>
            )}
          </div>

          <svg
            width="100%"
            height="350"
            viewBox="0 0 600 350"
            className={`w-full h-full ${
              mode !== "practice" ? "cursor-crosshair" : ""
            }`}
          >
            <defs>
              <pattern
                id="roadPattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect width="20" height="20" fill="#e5e7eb" />
                <line
                  x1="10"
                  y1="0"
                  x2="10"
                  y2="20"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </pattern>
              <pattern
                id="railPattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect width="20" height="4" fill="#5c4033" y="8" />
              </pattern>
            </defs>

            {renderCanvasContent()}
          </svg>

          <style>{`
            .animate-slide {
              animation: slide 3s linear infinite;
            }
            @keyframes slide {
              0% { transform: translateX(0px); }
              100% { transform: translateX(400px); }
            }
          `}</style>
        </Card>

        {/* Khu vực điều khiển (Thay đổi theo Mode) */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          {mode !== "practice" ? (
            // --- UI Điều khiển cho chế độ Khám Phá ---
            <>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <label className="flex justify-between text-gray-700 font-semibold mb-2">
                    <span>Góc xoay: {Math.abs(angle)}°</span>
                    <span className="text-gray-400 text-sm">
                      ↔ Kéo để chỉnh
                    </span>
                  </label>
                  <input
                    type="range"
                    min={mode === "parallel" ? -45 : 0}
                    max={mode === "parallel" ? 45 : 180}
                    value={angle}
                    onChange={handleSliderChange}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex gap-3">
                  {mode === "perpendicular" && (
                    <Button
                      onClick={() => setShowProtractor(!showProtractor)}
                      active={showProtractor}
                      variant="outline"
                    >
                      <Ruler size={18} />{" "}
                      {showProtractor ? "Cất Ê-ke" : "Dùng Ê-ke"}
                    </Button>
                  )}

                  <Button onClick={checkResult} variant="success">
                    <Check size={18} /> Kiểm Tra
                  </Button>

                  <Button
                    onClick={() => setAngle(mode === "parallel" ? 0 : 90)}
                    className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"
                    title="Đáp án nhanh"
                  >
                    <RotateCcw size={18} />
                  </Button>
                </div>
              </div>

              <div
                className={`mt-4 p-4 rounded-lg flex items-center gap-3 transition-colors ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : message.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-50 text-blue-800"
                }`}
              >
                <Info
                  size={24}
                  className={
                    message.type === "success"
                      ? "text-green-600"
                      : message.type === "error"
                      ? "text-red-500"
                      : "text-blue-500"
                  }
                />
                <span className="font-medium text-lg">{message.text}</span>
              </div>
            </>
          ) : (
            // --- UI Điều khiển cho chế độ Luyện Tập (Quiz) ---
            <div className="text-center">
              {!quizState.answered ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">
                    Chọn đáp án đúng nhất:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleAnswer("parallel")}
                      className="h-16 text-lg hover:shadow-md border-blue-200"
                    >
                      hai đường thẳng
                      <br />
                      SONG SONG
                    </Button>
                    <Button
                      onClick={() => handleAnswer("perpendicular")}
                      className="h-16 text-lg hover:shadow-md border-blue-200"
                    >
                      hai đường thẳng
                      <br />
                      VUÔNG GÓC
                    </Button>
                    <Button
                      onClick={() => handleAnswer("intersecting")}
                      className="h-16 text-lg hover:shadow-md border-blue-200"
                    >
                      hai đường thẳng
                      <br />
                      CẮT NHAU (KHÔNG VUÔNG)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div
                    className={`p-4 rounded-lg mb-4 flex flex-col items-center gap-2 ${
                      quizState.isCorrect
                        ? "bg-green-100 border border-green-200"
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    {quizState.isCorrect ? (
                      <>
                        <CheckCircle2 size={48} className="text-green-600" />
                        <span className="text-xl font-bold text-green-800">
                          Chính xác! +10 điểm
                        </span>
                        <p className="text-green-700">
                          {quizState.questionType === "parallel" &&
                            "Hai đường này không bao giờ cắt nhau."}
                          {quizState.questionType === "perpendicular" &&
                            "Chúng cắt nhau tạo thành góc vuông 90 độ."}
                          {quizState.questionType === "intersecting" &&
                            "Chúng cắt nhau nhưng góc tạo thành không phải 90 độ."}
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle size={48} className="text-red-600" />
                        <span className="text-xl font-bold text-red-800">
                          Tiếc quá, sai mất rồi!
                        </span>
                        <p className="text-red-700">
                          Đáp án đúng là:{" "}
                          <strong>
                            {quizState.questionType === "parallel"
                              ? "Song Song"
                              : quizState.questionType === "perpendicular"
                              ? "Vuông Góc"
                              : "Cắt Nhau (Không Vuông)"}
                          </strong>
                        </p>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={generateNewQuestion}
                    variant="default"
                    className="mx-auto w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Câu hỏi tiếp theo <ArrowRight size={20} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gợi ý sư phạm (Footer) */}
        <div className="mt-8 border-t pt-4 text-sm text-gray-500">
          <p className="italic text-center">
            * Gợi ý: Giáo viên có thể chia lớp thành các nhóm, sử dụng phần
            "Luyện Tập" để tổ chức thi đấu "Ai nhanh hơn".
          </p>
        </div>
      </div>
    </div>
  );
}
